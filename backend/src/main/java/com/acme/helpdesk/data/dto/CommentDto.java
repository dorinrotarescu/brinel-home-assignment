package com.acme.helpdesk.data.dto;

import java.time.LocalDateTime;

public record CommentDto(Long id, String content, PersonDto author, LocalDateTime createdDate) {
}
