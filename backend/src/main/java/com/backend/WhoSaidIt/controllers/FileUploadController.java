package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.services.FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
public class FileUploadController {

    private final FileUploadService service;

    public FileUploadController(FileUploadService service) {
        this.service = service;
    }

    @PostMapping("/upload/{userId}")
    public ResponseEntity<String> uploadGroupChat(
            @RequestPart("data") MultipartFile file,
            @PathVariable Integer userId,
            @RequestParam String name
    ) {
        try {
            service.persistGroupChatFromFile(userId, name, file);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error uploading file");
        }
    }
}
