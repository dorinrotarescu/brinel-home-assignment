package com.acme.helpdesk.service;

import com.acme.helpdesk.data.dto.TicketDto;
import com.acme.helpdesk.data.dto.TicketSummaryDto;
import com.acme.helpdesk.data.dto.request.AssignTicketRequest;
import com.acme.helpdesk.data.dto.request.CreateTicketRequest;
import com.acme.helpdesk.data.dto.request.TicketSearchCriteria;
import com.acme.helpdesk.data.mapper.TicketMapper;
import com.acme.helpdesk.data.model.Person;
import com.acme.helpdesk.data.model.PersonRoleEnum;
import com.acme.helpdesk.data.model.Ticket;
import com.acme.helpdesk.data.model.TicketCategoryEnum;
import com.acme.helpdesk.data.model.TicketPriorityEnum;
import com.acme.helpdesk.data.model.TicketStatusEnum;
import com.acme.helpdesk.data.repository.PersonRepository;
import com.acme.helpdesk.data.repository.TicketRepository;
import com.acme.helpdesk.exception.BadRequestException;
import com.acme.helpdesk.exception.ConflictException;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    private static final Pageable PAGEABLE = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdDate"));

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private PersonRepository personRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketService ticketService;

    @Captor
    private ArgumentCaptor<String> textCaptor;

    @Captor
    private ArgumentCaptor<Ticket> ticketCaptor;

    @Test
    void searchTickets_whenTextIsBlank_searchesWithoutTextFilter() {
        when(ticketRepository.search(any(), any(), any(), any())).thenReturn(Page.empty());

        ticketService.searchTickets(new TicketSearchCriteria(null, null, "   "), PAGEABLE);

        verify(ticketRepository).search(any(), any(), textCaptor.capture(), any());
        assertThat(textCaptor.getValue()).isNull();
    }

    @Test
    void searchTickets_whenTextHasSurroundingSpaces_searchesWithTrimmedText() {
        Ticket ticket = ticket(2L, TicketStatusEnum.OPEN);
        TicketSummaryDto ticketSummaryDto = ticketSummaryDto(2L);
        when(ticketRepository.search(TicketStatusEnum.OPEN, TicketPriorityEnum.MEDIUM, "wi-fi", PAGEABLE))
                .thenReturn(new PageImpl<>(List.of(ticket)));
        when(ticketMapper.toSummaryDto(ticket)).thenReturn(ticketSummaryDto);

        Page<TicketSummaryDto> result = ticketService.searchTickets(
                new TicketSearchCriteria(TicketStatusEnum.OPEN, TicketPriorityEnum.MEDIUM, "  wi-fi  "), PAGEABLE);

        assertThat(result.getContent()).containsExactly(ticketSummaryDto);
    }

    @Test
    void searchTickets_whenSortPropertyIsNotSupported_throwsBadRequest() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("status"));

        assertThatThrownBy(() -> ticketService.searchTickets(new TicketSearchCriteria(null, null, null), pageable))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Cannot sort by status");
        verify(ticketRepository, never()).search(any(), any(), any(), any());
    }

    @Test
    void getTicket_whenTicketDoesNotExist_throwsNotFound() {
        when(ticketRepository.findWithPersonsById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.getTicket(42L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Ticket 42 not found");
    }

    @Test
    void getTicket_whenTicketExists_returnsTicket() {
        Ticket ticket = ticket(2L, TicketStatusEnum.OPEN);
        TicketDto ticketDto = ticketDto(2L);
        when(ticketRepository.findWithPersonsById(2L)).thenReturn(Optional.of(ticket));
        when(ticketMapper.toDto(ticket)).thenReturn(ticketDto);

        TicketDto result = ticketService.getTicket(2L);

        assertThat(result).isEqualTo(ticketDto);
    }

    @Test
    void createTicket_whenRequesterDoesNotExist_throwsBadRequest() {
        when(personRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.createTicket(createTicketRequest(42L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Person 42 does not exist");
        verify(ticketRepository, never()).saveAndFlush(any());
    }

    @Test
    void createTicket_whenRequesterExists_savesOpenTicketWithoutAssignee() {
        Person requester = person(4L, PersonRoleEnum.EMPLOYEE);
        CreateTicketRequest request = createTicketRequest(4L);
        TicketDto ticketDto = ticketDto(1000L);
        when(personRepository.findById(4L)).thenReturn(Optional.of(requester));
        when(ticketMapper.toEntity(request)).thenReturn(new Ticket());
        when(ticketRepository.saveAndFlush(any(Ticket.class))).thenAnswer(returnsFirstArg());
        when(ticketMapper.toDto(any(Ticket.class))).thenReturn(ticketDto);

        TicketDto result = ticketService.createTicket(request);

        verify(ticketRepository).saveAndFlush(ticketCaptor.capture());
        Ticket savedTicket = ticketCaptor.getValue();
        assertThat(savedTicket.getStatus()).isEqualTo(TicketStatusEnum.OPEN);
        assertThat(savedTicket.getRequester()).isEqualTo(requester);
        assertThat(savedTicket.getAssignee()).isNull();
        assertThat(result).isEqualTo(ticketDto);
    }

    @Test
    void assignTicket_whenTicketDoesNotExist_throwsNotFound() {
        when(ticketRepository.findWithPersonsById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.assignTicket(42L, new AssignTicketRequest(2L)))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Ticket 42 not found");
        verify(ticketRepository, never()).saveAndFlush(any());
    }

    @Test
    void assignTicket_whenPersonDoesNotExist_throwsBadRequest() {
        when(ticketRepository.findWithPersonsById(1L)).thenReturn(Optional.of(ticket(1L, TicketStatusEnum.OPEN)));
        when(personRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.assignTicket(1L, new AssignTicketRequest(42L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Person 42 does not exist");
        verify(ticketRepository, never()).saveAndFlush(any());
    }

    @Test
    void assignTicket_whenPersonIsNotAnAgent_throwsBadRequest() {
        when(ticketRepository.findWithPersonsById(1L)).thenReturn(Optional.of(ticket(1L, TicketStatusEnum.OPEN)));
        when(personRepository.findById(4L)).thenReturn(Optional.of(person(4L, PersonRoleEnum.EMPLOYEE)));

        assertThatThrownBy(() -> ticketService.assignTicket(1L, new AssignTicketRequest(4L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Person 4 is not an agent");
        verify(ticketRepository, never()).saveAndFlush(any());
    }

    @Test
    void assignTicket_whenTicketIsClosed_throwsConflict() {
        when(ticketRepository.findWithPersonsById(10L)).thenReturn(Optional.of(ticket(10L, TicketStatusEnum.CLOSED)));
        when(personRepository.findById(2L)).thenReturn(Optional.of(person(2L, PersonRoleEnum.AGENT)));

        assertThatThrownBy(() -> ticketService.assignTicket(10L, new AssignTicketRequest(2L)))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Ticket 10 is closed and cannot be reassigned");
        verify(ticketRepository, never()).saveAndFlush(any());
    }

    @Test
    void assignTicket_whenPersonIsAnAgent_savesTicketWithAssignee() {
        Person agent = person(2L, PersonRoleEnum.AGENT);
        TicketDto ticketDto = ticketDto(1L);
        when(ticketRepository.findWithPersonsById(1L)).thenReturn(Optional.of(ticket(1L, TicketStatusEnum.OPEN)));
        when(personRepository.findById(2L)).thenReturn(Optional.of(agent));
        when(ticketRepository.saveAndFlush(any(Ticket.class))).thenAnswer(returnsFirstArg());
        when(ticketMapper.toDto(any(Ticket.class))).thenReturn(ticketDto);

        TicketDto result = ticketService.assignTicket(1L, new AssignTicketRequest(2L));

        verify(ticketRepository).saveAndFlush(ticketCaptor.capture());
        assertThat(ticketCaptor.getValue().getAssignee()).isEqualTo(agent);
        assertThat(result).isEqualTo(ticketDto);
    }

    private static Person person(Long id, PersonRoleEnum role) {
        Person person = new Person();
        person.setId(id);
        person.setRole(role);
        return person;
    }

    private static Ticket ticket(Long id, TicketStatusEnum status) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        ticket.setStatus(status);
        return ticket;
    }

    private static CreateTicketRequest createTicketRequest(Long requesterId) {
        return new CreateTicketRequest("Laptop does not start", "The screen stays black after the update.",
                TicketPriorityEnum.HIGH, TicketCategoryEnum.HARDWARE, requesterId);
    }

    private static TicketDto ticketDto(Long id) {
        return new TicketDto(id, "Laptop does not start", "The screen stays black after the update.",
                TicketStatusEnum.OPEN, TicketPriorityEnum.HIGH, TicketCategoryEnum.HARDWARE, null, null, null, null);
    }

    private static TicketSummaryDto ticketSummaryDto(Long id) {
        return new TicketSummaryDto(id, "Cannot connect to office Wi-Fi", TicketStatusEnum.OPEN,
                TicketPriorityEnum.MEDIUM, TicketCategoryEnum.NETWORK, "Omar Haddad", "Sam Carter", null);
    }
}
