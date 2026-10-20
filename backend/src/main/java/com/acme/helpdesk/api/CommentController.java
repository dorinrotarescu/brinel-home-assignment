package com.acme.helpdesk.api;

import com.acme.helpdesk.data.dto.CommentDto;
import com.acme.helpdesk.data.dto.request.CreateCommentRequest;
import com.acme.helpdesk.service.CommentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("${helpdesk.api.base-path}/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    @PostMapping
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long ticketId, @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(commentService.addComment(ticketId, request));
    }
}
