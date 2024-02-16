package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.DTOs.AuthenticationResponseDTO;
import com.backend.WhoSaidIt.DTOs.QuizTokenResponseDTO;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.exceptions.EmailAlreadyExistsException;
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
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.IM_USED).body(null);
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

    // This endpoint is used to update a user's password.
    // The endpoint is not prefixed with '/auth' because it requires an authentication token.
    // It is located in this class (rather than UserController) because it requires authentication services.
    @PatchMapping("/users/{userId}/password")
    public ResponseEntity<String> updateUserPassword(
            @PathVariable long userId,
            @RequestBody UpdatePasswordRequest request
    ) {
        try {
            authenticationService.updateUserPassword(userId, request.currentPassword(), request.newPassword());
            return ResponseEntity.ok("Password updated.");
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            // This exception is thrown when the old password provided does not match the user's current password.
            // We return a 422 status code to indicate that the request was valid, but the provided data was not.
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(e.getMessage());
        }
    }

    @PostMapping("/auth/request-password-reset")
    public ResponseEntity<String> requestPasswordReset(
            @RequestBody String email
    ) {
        try {
            authenticationService.requestPasswordReset(email);
            return ResponseEntity.ok("Password reset email sent.");
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Authentication for this endpoint is handled by the JwtAuthenticationFilter and PasswordResetAuthorizationManager.
    @PatchMapping("/password-reset/{userId}")
    public ResponseEntity<String> executePasswordReset(
            @PathVariable long userId,
            @RequestBody String newPassword
    ) {
        try {
            authenticationService.executePasswordReset(userId, newPassword);
            return ResponseEntity.ok("Password reset successfully.");
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // This endpoint is used to update a user's email.
    // The endpoint is not prefixed with '/auth' because it requires an authentication token.
    // It is located in this class (rather than UserController) because it requires authentication services.
    @PatchMapping("/users/{userId}/email")
    public ResponseEntity<String> updateUserEmail(
            @PathVariable long userId,
            @RequestBody UpdateEmailRequest request
    ) {
        try {
            authenticationService.updateUserEmail(userId, request.password(), request.newEmail());
            return ResponseEntity.ok("Email updated to: " + request.newEmail());
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            // This exception is thrown when the old password provided does not match the user's current password.
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(e.getMessage());
        }
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
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    public record RegisterRequest(String username, String password, String email) {}

    public record AuthenticationRequest(String username, String password) {}

    public record UpdatePasswordRequest(String currentPassword, String newPassword) {}

    public record UpdateEmailRequest(String password, String newEmail) {}
}