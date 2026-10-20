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
import com.acme.helpdesk.data.model.TicketStatusEnum;
import com.acme.helpdesk.data.repository.PersonRepository;
import com.acme.helpdesk.data.repository.TicketRepository;
import com.acme.helpdesk.exception.BadRequestException;
import com.acme.helpdesk.exception.ConflictException;
import com.acme.helpdesk.exception.NotFoundException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private static final Set<String> SORTABLE_PROPERTIES = Set.of("id", "title", "createdDate");

    private final TicketRepository ticketRepository;
    private final PersonRepository personRepository;
    private final TicketMapper ticketMapper;

    @Transactional(readOnly = true)
    public Page<TicketSummaryDto> searchTickets(TicketSearchCriteria criteria, Pageable pageable) {
        for (Sort.Order order : pageable.getSort()) {
            if (!SORTABLE_PROPERTIES.contains(order.getProperty())) {
                throw new BadRequestException("Cannot sort by %s".formatted(order.getProperty()));
            }
        }
        String text = StringUtils.hasText(criteria.text()) ? criteria.text().trim() : null;
        return ticketRepository.search(criteria.status(), criteria.priority(), text, pageable)
                .map(ticketMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public TicketDto getTicket(Long ticketId) {
        return ticketMapper.toDto(findTicket(ticketId));
    }

    @Transactional
    public TicketDto createTicket(CreateTicketRequest request) {
        Person requester = personRepository.findById(request.requesterId())
                .orElseThrow(() -> new BadRequestException("Person %d does not exist".formatted(request.requesterId())));
        Ticket ticket = ticketMapper.toEntity(request);
        ticket.setStatus(TicketStatusEnum.OPEN);
        ticket.setRequester(requester);
        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        log.info("Ticket {} created by person {}", savedTicket.getId(), requester.getId());
        return ticketMapper.toDto(savedTicket);
    }

    @Transactional
    public TicketDto assignTicket(Long ticketId, AssignTicketRequest request) {
        Ticket ticket = findTicket(ticketId);
        Person assignee = personRepository.findById(request.assigneeId())
                .orElseThrow(() -> new BadRequestException("Person %d does not exist".formatted(request.assigneeId())));
        if (assignee.getRole() != PersonRoleEnum.AGENT) {
            throw new BadRequestException("Person %d is not an agent".formatted(assignee.getId()));
        }
        if (ticket.getStatus() == TicketStatusEnum.CLOSED) {
            throw new ConflictException("Ticket %d is closed and cannot be reassigned".formatted(ticketId));
        }
        ticket.setAssignee(assignee);
        Ticket savedTicket = ticketRepository.saveAndFlush(ticket);
        log.info("Ticket {} assigned to person {}", ticketId, assignee.getId());
        return ticketMapper.toDto(savedTicket);
    }

    private Ticket findTicket(Long ticketId) {
        return ticketRepository.findWithPersonsById(ticketId)
                .orElseThrow(() -> new NotFoundException("Ticket %d not found".formatted(ticketId)));
    }
}
