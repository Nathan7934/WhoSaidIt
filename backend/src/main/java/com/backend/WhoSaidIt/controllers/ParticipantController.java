package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.ParticipantDTO;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.services.ParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @GetMapping("participants/{participantId}")
    public ResponseEntity<ParticipantDTO> getParticipant(@PathVariable long participantId) {
        return ResponseEntity.ok(participantService.getParticipant(participantId));
    }

    @GetMapping("groupChats/{groupChatId}/participants")
    public ResponseEntity<List<ParticipantDTO>> getGroupChatParticipants(@PathVariable long groupChatId) {
        return ResponseEntity.ok(participantService.getGroupChatParticipants(groupChatId));
    }

    @PatchMapping("participants/{participantId}/name")
    public ResponseEntity<String> updateParticipantName(
            @PathVariable long participantId,
            @RequestBody ParticipantUpdateRequest request
    ) {
        try {
            participantService.updateParticipantName(participantId, request.name());
            return ResponseEntity.ok("Participant name updated to " + request.name());
        } catch (DataNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public record ParticipantUpdateRequest(String name) {}
}


