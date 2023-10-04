package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.MessageDTO;
import com.backend.WhoSaidIt.DTOs.MessagePageDTO;
import com.backend.WhoSaidIt.entities.Message;
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
    @GetMapping("/groupChats/{groupChatId}/messages/random")
    public ResponseEntity<MessageDTO> getRandomMessage(
            @PathVariable long groupChatId,
            @RequestParam(required = false) String excludedMessageIds
    ) {
        List<Long> ids = new ArrayList<>();
        if (excludedMessageIds != null) {
            ids = Arrays.stream(excludedMessageIds.split(","))
                    .map(Long::valueOf).collect(Collectors.toList());
        }
        return ResponseEntity.ok(messageService.getRandom(groupChatId, ids));
    }

    @GetMapping("/groupChats/{groupChatId}/messages/paginated")
    public ResponseEntity<MessagePageDTO> getPaginatedMessages(
            @PathVariable long groupChatId,
            @RequestParam int pageNumber,
            @RequestParam int pageSize
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("timestamp").ascending());
        Page<MessageDTO> messages = messageService.getPaginatedMessages(groupChatId, pageable);
        return ResponseEntity.ok(new MessagePageDTO(
                messages.getNumber(),
                messages.getTotalPages(),
                messages.getTotalElements(),
                messages.hasNext(),
                messages.hasPrevious(),
                messages.getContent()
        ));
    }

    @GetMapping("/messages/{messageId}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable long messageId) {
        return ResponseEntity.ok(messageService.get(messageId));
    }

    @DeleteMapping("/messages/{messageId}")
    public void deleteMessage(@PathVariable long messageId) {
        messageService.remove(messageId);
    }
}
