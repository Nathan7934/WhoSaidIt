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
        // Currently, all requests aside from authentication requests require a JWT token.

        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/quizzes/**").access(quizAuthorizationManager)
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().access(userAuthorizationManager)
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}