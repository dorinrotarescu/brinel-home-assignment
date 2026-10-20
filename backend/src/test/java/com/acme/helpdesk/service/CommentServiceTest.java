package com.acme.helpdesk.service;

import com.acme.helpdesk.data.dto.CommentDto;
import com.acme.helpdesk.data.dto.request.CreateCommentRequest;
import com.acme.helpdesk.data.mapper.CommentMapper;
import com.acme.helpdesk.data.model.Comment;
import com.acme.helpdesk.data.model.Person;
import com.acme.helpdesk.data.model.PersonRoleEnum;
import com.acme.helpdesk.data.model.Ticket;
import com.acme.helpdesk.data.repository.CommentRepository;
import com.acme.helpdesk.data.repository.PersonRepository;
import com.acme.helpdesk.data.repository.TicketRepository;
import com.acme.helpdesk.exception.BadRequestException;
import com.acme.helpdesk.exception.NotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private PersonRepository personRepository;

    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private CommentService commentService;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    @Test
    void addComment_whenTicketDoesNotExist_throwsNotFound() {
        when(ticketRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.addComment(42L, createCommentRequest(1L)))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Ticket 42 not found");
        verify(commentRepository, never()).saveAndFlush(any());
    }

    @Test
    void addComment_whenAuthorDoesNotExist_throwsBadRequest() {
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(ticket(2L)));
        when(personRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.addComment(2L, createCommentRequest(42L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Person 42 does not exist");
        verify(commentRepository, never()).saveAndFlush(any());
    }

    @Test
    void addComment_whenTicketAndAuthorExist_savesCommentOnTicket() {
        Ticket ticket = ticket(2L);
        Person author = person(1L, PersonRoleEnum.AGENT);
        CreateCommentRequest request = createCommentRequest(1L);
        CommentDto commentDto = commentDto(1000L);
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(ticket));
        when(personRepository.findById(1L)).thenReturn(Optional.of(author));
        when(commentMapper.toEntity(request)).thenReturn(new Comment());
        when(commentRepository.saveAndFlush(any(Comment.class))).thenAnswer(returnsFirstArg());
        when(commentMapper.toDto(any(Comment.class))).thenReturn(commentDto);

        CommentDto result = commentService.addComment(2L, request);

        verify(commentRepository).saveAndFlush(commentCaptor.capture());
        Comment savedComment = commentCaptor.getValue();
        assertThat(savedComment.getTicket()).isEqualTo(ticket);
        assertThat(savedComment.getAuthor()).isEqualTo(author);
        assertThat(result).isEqualTo(commentDto);
    }

    @Test
    void getComments_whenTicketDoesNotExist_throwsNotFound() {
        when(ticketRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.getComments(42L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Ticket 42 not found");
    }

    @Test
    void getComments_whenTicketExists_returnsComments() {
        List<Comment> comments = List.of(new Comment());
        List<CommentDto> commentDtos = List.of(commentDto(1L));
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(ticket(2L)));
        when(commentRepository.findAllByTicketIdOrderByCreatedDateAscIdAsc(2L)).thenReturn(comments);
        when(commentMapper.toDtos(comments)).thenReturn(commentDtos);

        List<CommentDto> result = commentService.getComments(2L);

        assertThat(result).isEqualTo(commentDtos);
    }

    private static Person person(Long id, PersonRoleEnum role) {
        Person person = new Person();
        person.setId(id);
        person.setRole(role);
        return person;
    }

    private static Ticket ticket(Long id) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        return ticket;
    }

    private static CreateCommentRequest createCommentRequest(Long authorId) {
        return new CreateCommentRequest(authorId, "Please restart the router and try again.");
    }

    private static CommentDto commentDto(Long id) {
        return new CommentDto(id, "Please restart the router and try again.", null, null);
    }
}
