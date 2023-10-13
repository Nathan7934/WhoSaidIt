package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.DTOs.AuthenticationResponseDTO;
import com.backend.WhoSaidIt.entities.Role;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        User user = new User(
                username,
                passwordEncoder.encode(password), // Passwords are stored in the database as hashes, not plaintext
                email,
                Role.USER
        );
        userRepository.save(user);
        String jwtToken = jwtService.generateUserToken(user);
        return new AuthenticationResponseDTO(jwtToken);
    }

    public AuthenticationResponseDTO generateQuizToken(long quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(
                () -> new DataNotFoundException("Quiz with id " + quizId + " not found")
        );
        String jwtToken = jwtService.generateQuizToken(quiz);
        return new AuthenticationResponseDTO(jwtToken);
    }

    public AuthenticationResponseDTO authenticate(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        // If authentication fails, an exception is thrown and the remainder is not executed.

        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new DataNotFoundException("User with username " + username + " not found")
        );
        String jwtToken = jwtService.generateUserToken(user);
        return new AuthenticationResponseDTO(jwtToken);
    }
}