package com.acme.helpdesk.data.mapper;

import com.acme.helpdesk.data.dto.TicketDto;
import com.acme.helpdesk.data.dto.TicketSummaryDto;
import com.acme.helpdesk.data.dto.request.CreateTicketRequest;
import com.acme.helpdesk.data.model.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = PersonMapper.class)
public interface TicketMapper {

    TicketDto toDto(Ticket ticket);

    @Mapping(target = "requesterName", source = "requester.fullName")
    @Mapping(target = "assigneeName", source = "assignee.fullName")
    TicketSummaryDto toSummaryDto(Ticket ticket);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "requester", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    Ticket toEntity(CreateTicketRequest request);
}
