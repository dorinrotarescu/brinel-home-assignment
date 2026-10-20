package com.acme.helpdesk.data.dto;

import com.acme.helpdesk.data.model.TicketCategoryEnum;
import com.acme.helpdesk.data.model.TicketPriorityEnum;
import com.acme.helpdesk.data.model.TicketStatusEnum;
import java.time.LocalDateTime;

public record TicketSummaryDto(
        Long id,
        String title,
        TicketStatusEnum status,
        TicketPriorityEnum priority,
        TicketCategoryEnum category,
        String requesterName,
        String assigneeName,
        LocalDateTime createdDate) {
}
