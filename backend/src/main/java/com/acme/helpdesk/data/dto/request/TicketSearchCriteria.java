package com.acme.helpdesk.data.dto.request;

import com.acme.helpdesk.data.model.TicketPriorityEnum;
import com.acme.helpdesk.data.model.TicketStatusEnum;
import jakarta.validation.constraints.Size;

public record TicketSearchCriteria(
        TicketStatusEnum status,
        TicketPriorityEnum priority,
        @Size(max = 100, message = "Text must be at most 100 characters") String text) {
}
