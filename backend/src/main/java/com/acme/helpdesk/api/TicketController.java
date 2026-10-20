package com.acme.helpdesk.api;

import com.acme.helpdesk.data.dto.TicketDto;
import com.acme.helpdesk.data.dto.TicketSummaryDto;
import com.acme.helpdesk.data.dto.request.AssignTicketRequest;
import com.acme.helpdesk.data.dto.request.CreateTicketRequest;
import com.acme.helpdesk.data.dto.request.TicketSearchCriteria;
import com.acme.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("${helpdesk.api.base-path}/tickets")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/search")
    public ResponseEntity<PagedModel<TicketSummaryDto>> searchTickets(
            @Valid @RequestBody TicketSearchCriteria criteria,
            @PageableDefault(sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(new PagedModel<>(ticketService.searchTickets(criteria, pageable)));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketDto> getTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getTicket(ticketId));
    }

    @PostMapping
    public ResponseEntity<TicketDto> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    @PutMapping("/{ticketId}/assignee")
    public ResponseEntity<TicketDto> assignTicket(
            @PathVariable Long ticketId, @Valid @RequestBody AssignTicketRequest request) {
        return ResponseEntity.ok(ticketService.assignTicket(ticketId, request));
    }
}
