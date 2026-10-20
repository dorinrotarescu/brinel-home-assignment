package com.acme.helpdesk.service;

import com.acme.helpdesk.data.dto.CommentDto;
import com.acme.helpdesk.data.dto.request.CreateCommentRequest;
import com.acme.helpdesk.data.mapper.CommentMapper;
import com.acme.helpdesk.data.model.Comment;
import com.acme.helpdesk.data.model.Person;
import com.acme.helpdesk.data.model.Ticket;
import com.acme.helpdesk.data.repository.CommentRepository;
import com.acme.helpdesk.data.repository.PersonRepository;
import com.acme.helpdesk.data.repository.TicketRepository;
import com.acme.helpdesk.exception.BadRequestException;
import com.acme.helpdesk.exception.NotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final PersonRepository personRepository;
    private final CommentMapper commentMapper;

    @Transactional(readOnly = true)
    public List<CommentDto> getComments(Long ticketId) {
        findTicket(ticketId);
        return commentMapper.toDtos(commentRepository.findAllByTicketIdOrderByCreatedDateAscIdAsc(ticketId));
    }

    @Transactional
    public CommentDto addComment(Long ticketId, CreateCommentRequest request) {
        Ticket ticket = findTicket(ticketId);
        Person author = personRepository.findById(request.authorId())
                .orElseThrow(() -> new BadRequestException("Person %d does not exist".formatted(request.authorId())));
        Comment comment = commentMapper.toEntity(request);
        comment.setTicket(ticket);
        comment.setAuthor(author);
        Comment savedComment = commentRepository.saveAndFlush(comment);
        log.info("Comment {} added to ticket {} by person {}", savedComment.getId(), ticketId, author.getId());
        return commentMapper.toDto(savedComment);
    }

    private Ticket findTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("Ticket %d not found".formatted(ticketId)));
    }
}
