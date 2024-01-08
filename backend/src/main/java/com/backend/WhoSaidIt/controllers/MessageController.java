package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.MessageDTO;
import com.backend.WhoSaidIt.DTOs.MessagePageDTO;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.services.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // The request parameter excludedMessageIds is a comma separated list of message ids that should be excluded from
    // the random selection. This is to prevent the same message from being selected twice in a session.
    @GetMapping("/quizzes/{quizId}/messages/random")
    public ResponseEntity<MessageDTO> getRandomQuizMessage(
            @PathVariable long quizId,
            @RequestParam(required = false) String excludedMessageIds
    ) {
        List<Long> ids = new ArrayList<>();
        if (excludedMessageIds != null) {
            ids = Arrays.stream(excludedMessageIds.split(","))
                    .map(Long::valueOf).collect(Collectors.toList());
        }
        try {
            return ResponseEntity.ok(messageService.getRandomQuizMessage(quizId, ids));
        } catch (DataNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/group-chats/{groupChatId}/messages/paginated")
    public ResponseEntity<MessagePageDTO> getPaginatedGroupChatMessages(
            @PathVariable long groupChatId,
            @RequestParam int pageNumber,
            @RequestParam int pageSize,
            @RequestParam boolean ascending,
            @RequestParam(required = false) Long participantId
    ) {
        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                ascending ? Sort.by("timestamp").ascending() : Sort.by("timestamp").descending()
        );
        Page<MessageDTO> messages;
        if (participantId != null) {
            messages = messageService.getPaginatedGroupChatMessages(groupChatId, participantId, pageable);
        } else {
            messages = messageService.getPaginatedGroupChatMessages(groupChatId, pageable);
        }
        return ResponseEntity.ok(toMessagePageDTO(messages));
    }

    // TODO: There may be a way to combine the code for these endpoints into one method
    @GetMapping("/quizzes/{quizId}/messages/paginated")
    public ResponseEntity<MessagePageDTO> getPaginatedQuizMessages(
            @PathVariable long quizId,
            @RequestParam int pageNumber,
            @RequestParam int pageSize,
            @RequestParam boolean ascending,
            @RequestParam(required = false) Long participantId
    ) {
        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                ascending ? Sort.by("m.timestamp").ascending() : Sort.by("m.timestamp").descending()
        );
        Page<MessageDTO> messages;
        if (participantId != null) {
            messages = messageService.getPaginatedQuizMessages(quizId, participantId, pageable);
        } else {
            messages = messageService.getPaginatedQuizMessages(quizId, pageable);
        }
        return ResponseEntity.ok(toMessagePageDTO(messages));
    }

    @GetMapping("/messages/{messageId}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable long messageId) {
        return ResponseEntity.ok(messageService.getMessage(messageId));
    }

    @GetMapping("/quizzes/{quizId}/messages")
    public ResponseEntity<List<MessageDTO>> getMessagesByQuizId(@PathVariable long quizId) {
        return ResponseEntity.ok(messageService.getMessagesByQuizId(quizId));
    }

    @DeleteMapping("/group-chats/{groupChatId}/messages")
    public ResponseEntity<String> deleteMessages(
            @PathVariable long groupChatId,
            @RequestBody List<Long> messageIds
    ) {
        try {
            // The groupChatId isn't used here, but it's included in the path to satisfy security requirements
            messageService.deleteMessages(messageIds);
            return ResponseEntity.ok(
                    "Messages with ids " + messageIds + " deleted from group chat with id " + groupChatId + "."
            );
        } catch (DataNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private static MessagePageDTO toMessagePageDTO(Page<MessageDTO> messages) {
        return new MessagePageDTO(
                messages.getNumber(),
                messages.getTotalPages(),
                messages.getTotalElements(),
                messages.hasNext(),
                messages.hasPrevious(),
                messages.getContent()
        );
    }
}
