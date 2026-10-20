package com.acme.helpdesk.data.mapper;

import com.acme.helpdesk.data.dto.CommentDto;
import com.acme.helpdesk.data.dto.request.CreateCommentRequest;
import com.acme.helpdesk.data.model.Comment;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = PersonMapper.class)
public interface CommentMapper {

    CommentDto toDto(Comment comment);

    List<CommentDto> toDtos(List<Comment> comments);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ticket", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    Comment toEntity(CreateCommentRequest request);
}
