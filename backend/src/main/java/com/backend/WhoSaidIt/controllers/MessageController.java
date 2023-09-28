package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.services.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // The request parameter excludedMessageIds is a comma separated list of message ids that should be excluded from
    // the random selection. This is to prevent the same message from being selected twice in a session.
    @GetMapping("/messages/{groupChatId}/random")
    public ResponseEntity<Message> getRandomMessage(
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
}
