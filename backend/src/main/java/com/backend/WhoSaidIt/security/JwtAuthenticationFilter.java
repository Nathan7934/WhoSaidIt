package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import com.backend.WhoSaidIt.security.tokens.QuizAuthenticationToken;
import com.backend.WhoSaidIt.security.tokens.TokenType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    // We have provided a custom implementation of the UserDetailsService interface in the ApplicationConfig class.
    private final UserDetailsService userDetailsService;
    private final QuizRepository quizRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService, QuizRepository quizRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.quizRepository = quizRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;

        // If the authorization header is null or doesn't start with "Bearer ", then the request is passed on to the
        // next filter in the filter chain.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        jwtToken = authHeader.substring(7); // Remove "Bearer " from the authorization header.

        // Check if it is a quiz token or a user token.
        TokenType tokenType = jwtService.extractTokenType(jwtToken);

        if(TokenType.USER.equals(tokenType)) {
            // If we have a user that is not authenticated, we check if their provided token is valid. If it is, we
            // authenticate them by setting their authentication object in the SecurityContextHolder.
            String username = jwtService.extractSubject(jwtToken);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtService.validateUserToken(jwtToken, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } else if (TokenType.QUIZ.equals(tokenType)) {
            String quizId = jwtService.extractSubject(jwtToken);
            if (quizId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Quiz quiz = quizRepository.findById(Long.parseLong(quizId)).orElseThrow(
                        () -> new DataNotFoundException("Quiz with id " + quizId + " not found")
                );
                if (jwtService.validateQuizToken(jwtToken, quiz)) {
                    QuizAuthenticationToken authToken = new QuizAuthenticationToken(quizId);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}