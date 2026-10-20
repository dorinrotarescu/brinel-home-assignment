package com.acme.helpdesk.data.dto;

import com.acme.helpdesk.data.model.TicketCategoryEnum;
import com.acme.helpdesk.data.model.TicketPriorityEnum;
import com.acme.helpdesk.data.model.TicketStatusEnum;
import java.time.LocalDateTime;

public record TicketDto(
        Long id,
        String title,
        String description,
        TicketStatusEnum status,
        TicketPriorityEnum priority,
        TicketCategoryEnum category,
        PersonDto requester,
        PersonDto assignee,
        LocalDateTime createdDate,
        LocalDateTime updatedDate) {
}
