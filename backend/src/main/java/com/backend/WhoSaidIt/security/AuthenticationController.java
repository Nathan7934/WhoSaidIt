package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.DTOs.AuthenticationResponseDTO;
import com.backend.WhoSaidIt.exceptions.UserAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<AuthenticationResponseDTO> register(
            @RequestBody RegisterRequest request
    ) {
        AuthenticationResponseDTO newUserAuth;
        try {
            newUserAuth = authenticationService.register(request.email(), request.username(), request.password());
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        return ResponseEntity.ok(newUserAuth);
    }

    @PostMapping("/auth/authenticate")
    public ResponseEntity<AuthenticationResponseDTO> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request.username(), request.password()));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<AuthenticationResponseDTO> refresh(
            @RequestHeader(name="Authorization") String refreshHeader
    ) {
        if (refreshHeader != null && refreshHeader.startsWith("Bearer ")) {
            String refreshToken = refreshHeader.substring(7).trim();
            return ResponseEntity.ok(authenticationService.refresh(refreshToken));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    // This endpoint is used to generate a shareable quiz token.
    // Requires the caller to be an authenticated user who owns the quiz with quizId.
    @PostMapping("/quizzes/{quizId}/auth/generate-token")
    public ResponseEntity<AuthenticationResponseDTO> generateQuizToken(
            @PathVariable long quizId
    ) {
        return ResponseEntity.ok(authenticationService.generateQuizToken(quizId));
    }

    public record RegisterRequest(String username, String password, String email) {}

    public record AuthenticationRequest(String username, String password) {}
}