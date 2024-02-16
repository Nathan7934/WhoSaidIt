package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.exceptions.BadFormatException;
import com.backend.WhoSaidIt.services.FileUploadService;
import org.springframework.http.HttpStatus;
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
        } catch (BadFormatException e) {
            // This exception is thrown when the algorithm fails to parse any messages from the file.
            // This is likely due to the file being in an unexpected format.
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(e.getMessage());
        }
    }
}
