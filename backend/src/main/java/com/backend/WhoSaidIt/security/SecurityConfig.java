package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.security.authentication_managers.QuizAuthorizationManager;
import com.backend.WhoSaidIt.security.authentication_managers.UserAuthorizationManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // This class binds the JwtAuthenticationFilter to the security filter chain.
    // It is also where we define the endpoints that require authentication.

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    private final QuizAuthorizationManager quizAuthorizationManager;
    private final UserAuthorizationManager userAuthorizationManager;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            AuthenticationProvider authenticationProvider,
            QuizAuthorizationManager quizAuthorizationManager,
            UserAuthorizationManager userAuthorizationManager
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
        this.quizAuthorizationManager = quizAuthorizationManager;
        this.userAuthorizationManager = userAuthorizationManager;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Currently, all API requests that access resources require authentication.
        // This is done by requiring a valid JWT token in the Authorization header of the request.
        // Quizzes use a separate authorization manager to account for shareable quiz tokens.
        // Request to the /api/auth/** endpoints do not require authentication.

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/quizzes/**").access(quizAuthorizationManager)
                .requestMatchers("/api/users/**").access(userAuthorizationManager)
                .requestMatchers("/api/messages/**").access(userAuthorizationManager)
                .requestMatchers("/api/groupChats/**").access(userAuthorizationManager)
                .requestMatchers("/api/participants/**").access(userAuthorizationManager)
                .requestMatchers("/api/leaderboard/**").access(userAuthorizationManager)
                .anyRequest().permitAll()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // TODO: Add other allowed origins as needed
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}