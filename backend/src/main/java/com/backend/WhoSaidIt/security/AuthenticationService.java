package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.DTOs.AuthenticationResponseDTO;
import com.backend.WhoSaidIt.DTOs.QuizTokenResponseDTO;
import com.backend.WhoSaidIt.entities.Role;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.exceptions.EmailAlreadyExistsException;
import com.backend.WhoSaidIt.exceptions.UserAlreadyExistsException;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final JwtService jwtService;
    private final EmailService emailService;

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            QuizRepository quizRepository,
            JwtService jwtService,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponseDTO register(String email, String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("Username " + username + " is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already in use");
        }

        User user = new User(
                username,
                passwordEncoder.encode(password), // Passwords are stored in the database as hashes, not plaintext
                email,
                Role.USER
        );
        user = userRepository.save(user);
        String accessToken = jwtService.generateUserToken(user);
        String refreshToken = jwtService.generateUserRefreshToken(user);
        return new AuthenticationResponseDTO(user.getId(), accessToken, refreshToken);
    }

    public AuthenticationResponseDTO authenticate(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        // If authentication fails, an exception is thrown and the remainder is not executed.

        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new DataNotFoundException("User with username " + username + " not found")
        );
        String accessToken = jwtService.generateUserToken(user);
        String refreshToken = jwtService.generateUserRefreshToken(user);
        return new AuthenticationResponseDTO(user.getId(), accessToken, refreshToken);
    }

    public AuthenticationResponseDTO refresh(String refreshToken) {
        String username = jwtService.extractSubject(refreshToken);
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new DataNotFoundException("User with username " + username + " not found")
        );
        if (!jwtService.validateUserRefreshToken(refreshToken, user)) {
            throw new IllegalArgumentException("Invalid refresh token. User must authenticate again.");
        }
        String accessToken = jwtService.generateUserToken(user);
        String newRefreshToken = jwtService.generateUserRefreshToken(user);
        return new AuthenticationResponseDTO(user.getId(), accessToken, newRefreshToken);
    }

    // This method is used to request a password reset. It sends an email to the user with a link to reset their password.
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new DataNotFoundException("User with email " + email + " not found")
        );
        String passwordResetToken = jwtService.generatePasswordResetToken(user);
        String resetUrl = "https://whosaidit.app/reset-password/" + passwordResetToken;

        // Email the user with a link to reset their password.
        String subject = "Password Reset Requested";
        String content =
            "<p>A password reset was requested for your WhoSaidIt account, <b>" + user.getUsername() + "</b>. " +
            "If this wasn't you, you can safely ignore this email.</p>" +
            "<p>To reset your password, click the link below:</p>" +
            "<a href=\"" + resetUrl + "\">" + resetUrl + "</a>" +
            "<p>This link will expire after 30 minutes.</p>";

        emailService.sendEmail(email, subject, content, true);
    }

    @Transactional
    public void updateUserPassword(long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new DataNotFoundException("User with id " + userId + " not found")
        );
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordModifiedDate(LocalDateTime.now());
    }

    @Transactional
    public void updateUserEmail(long userId, String password, String newEmail) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new DataNotFoundException("User with id " + userId + " not found")
        );
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Password is incorrect");
        }
        user.setEmail(newEmail);
    }

    @Transactional
    public QuizTokenResponseDTO getQuizAccessToken(long quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(
                () -> new DataNotFoundException("Quiz with id " + quizId + " not found")
        );

        // If a shareable link has not been generated yet, we generate them and assign them to the quiz.
        if (quiz.getShareableAccessToken() == null || quiz.getUrlToken() == null) {
            String jwtToken = jwtService.generateQuizToken(quiz);
            quiz.setShareableAccessToken(jwtToken);

            String urlToken;
            do {
                urlToken = UrlTokenGenerator.generateUrlToken();
            } while (quizRepository.existsByUrlToken(urlToken)); // Ensure uniqueness
            quiz.setUrlToken(urlToken);

            return new QuizTokenResponseDTO(jwtToken, urlToken);
        }

        return new QuizTokenResponseDTO(quiz.getShareableAccessToken(), quiz.getUrlToken());
    }

    // Takes a URL token and retrieves its corresponding access token (if the URL token matches what is stored)
    public QuizTokenResponseDTO validateQuizUrlToken(long quizId, String urlToken) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(
                () -> new DataNotFoundException("Quiz with id " + quizId + " not found")
        );

        if (!quiz.getUrlToken().equals(urlToken)) {
            throw new IllegalArgumentException("Invalid URL token");
        }

        return new QuizTokenResponseDTO(quiz.getShareableAccessToken(), quiz.getUrlToken());
    }
}