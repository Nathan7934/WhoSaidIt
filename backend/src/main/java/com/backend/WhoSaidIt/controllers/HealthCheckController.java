package com.backend.WhoSaidIt.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// A simple controller to check if the server is running.

@RestController
public class HealthCheckController {

    @GetMapping("/health")
    public String healthCheck() {
        return "I'm alive!";
    }
}
