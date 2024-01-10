package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.DTOs.AuthenticationResponseDTO;
import com.backend.WhoSaidIt.DTOs.QuizTokenResponseDTO;
import com.backend.WhoSaidIt.exceptions.UserAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthenticationController {

    // This class handles requests to the /api/auth/** endpoints. These endpoints are the only ones that do not require
    // authentication. The endpoints are used for registering new users, authenticating existing users, generating
    // shareable quiz tokens, and determining whether a user without an account followed a valid shareable link.

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
    // STILL REQUIRES AUTHENTICATION (hence no '/auth' prefix in the path)
    @PostMapping("/quizzes/{quizId}/generate-token")
    public ResponseEntity<QuizTokenResponseDTO> generateQuizToken(
            @PathVariable long quizId
    ) {
        return ResponseEntity.ok(authenticationService.getQuizAccessToken(quizId));
    }

    @PostMapping("/auth/quizzes/{quizId}/validate-url-token")
    public ResponseEntity<QuizTokenResponseDTO> validateQuizUrlToken(
            @PathVariable long quizId,
            @RequestBody String urlToken
    ) {
        try {
            return ResponseEntity.ok(authenticationService.validateQuizUrlToken(quizId, urlToken));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    public record RegisterRequest(String username, String password, String email) {}

    public record AuthenticationRequest(String username, String password) {}


}