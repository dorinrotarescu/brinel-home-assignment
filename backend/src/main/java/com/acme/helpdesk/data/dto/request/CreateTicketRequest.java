package com.acme.helpdesk.data.dto.request;

import com.acme.helpdesk.data.model.TicketCategoryEnum;
import com.acme.helpdesk.data.model.TicketPriorityEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 120, message = "Title must be at most 120 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @NotNull(message = "Priority is required")
        TicketPriorityEnum priority,

        @NotNull(message = "Category is required")
        TicketCategoryEnum category,

        @NotNull(message = "Requester is required")
        Long requesterId) {
}
