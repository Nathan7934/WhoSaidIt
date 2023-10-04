package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.backend.WhoSaidIt.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable long userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @GetMapping("/groupChats/{groupChatId}/user")
    public ResponseEntity<UserDTO> getGroupChatUser(@PathVariable long groupChatId) {
        return ResponseEntity.ok(userService.getGroupChatUser(groupChatId));
    }
}