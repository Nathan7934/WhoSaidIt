package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.DTOs.AuthenticationResponseDTO;
import com.backend.WhoSaidIt.DTOs.QuizTokenResponseDTO;
import com.backend.WhoSaidIt.entities.Role;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.exceptions.UserAlreadyExistsException;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            QuizRepository quizRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponseDTO register(String email, String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("Username " + username + " is already taken");
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
        if (!jwtService.validateUserToken(refreshToken, user)) {
            throw new IllegalArgumentException("Invalid refresh token. User must authenticate again.");
        }
        String accessToken = jwtService.generateUserToken(user);
        String newRefreshToken = jwtService.generateUserRefreshToken(user);
        return new AuthenticationResponseDTO(user.getId(), accessToken, newRefreshToken);

        // TODO: Implement a way to invalidate refresh tokens once used.
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