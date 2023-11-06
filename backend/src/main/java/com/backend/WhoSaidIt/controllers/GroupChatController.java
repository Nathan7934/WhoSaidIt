package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.GroupChatDTO;
import com.backend.WhoSaidIt.DTOs.GroupChatInfoDTO;
import com.backend.WhoSaidIt.services.GroupChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class GroupChatController {

    private final GroupChatService groupChatService;

    public GroupChatController(GroupChatService groupChatService) {
        this.groupChatService = groupChatService;
    }

    @GetMapping("/users/{userId}/groupChats")
    public ResponseEntity<List<GroupChatDTO>> getUserGroupChats(@PathVariable long userId) {
        return ResponseEntity.ok(groupChatService.getUserGroupChats(userId));
    }

    @GetMapping("/users/{userId}/groupChats/info")
    public ResponseEntity<List<GroupChatInfoDTO>> getAllUserGroupChatInfo(@PathVariable long userId) {
        return ResponseEntity.ok(groupChatService.getAllUserGroupChatInfo(userId));
    }

    @GetMapping("/groupChats/{groupChatId}")
    public ResponseEntity<GroupChatDTO> getGroupChat(@PathVariable long groupChatId) {
        return ResponseEntity.ok(groupChatService.getGroupChat(groupChatId));
    }

    @DeleteMapping("/groupChats/{groupChatId}")
    public void deleteGroupChat(@PathVariable long groupChatId) {
        groupChatService.deleteGroupChat(groupChatId);
    }
}
