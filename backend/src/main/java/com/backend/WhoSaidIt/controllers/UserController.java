package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.services.GroupChatService;
import com.backend.WhoSaidIt.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final GroupChatService groupChatService;

    public UserController(UserService userService, GroupChatService groupChatService) {
        this.userService = userService;
        this.groupChatService = groupChatService;
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable long userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @GetMapping("/group-chats/{groupChatId}/user")
    public ResponseEntity<UserDTO> getGroupChatUser(@PathVariable long groupChatId) {
        return ResponseEntity.ok(groupChatService.getGroupChatUser(groupChatId));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok("User with id " + userId + " deleted.");
        } catch (DataNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}