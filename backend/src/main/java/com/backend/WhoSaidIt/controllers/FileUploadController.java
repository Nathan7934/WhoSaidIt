package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.services.FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/users/{userId}/group-chats/upload")
    public ResponseEntity<String> uploadGroupChat(
            @RequestPart("data") MultipartFile file,
            @PathVariable Long userId,
            @RequestParam String name,
            @RequestParam Integer minCharacters
    ) {
        try {
            fileUploadService.persistGroupChatFromFile(userId, name, file, minCharacters);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error uploading file");
        }
    }
}
