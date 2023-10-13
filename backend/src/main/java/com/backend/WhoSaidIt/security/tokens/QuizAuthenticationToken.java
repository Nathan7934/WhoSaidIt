package com.backend.WhoSaidIt.security.tokens;

import org.springframework.security.authentication.AbstractAuthenticationToken;

public class QuizAuthenticationToken extends AbstractAuthenticationToken {
    // This class is used to represent the authentication status of a shareable JWT for a quiz.

    private final String quizId;

    public QuizAuthenticationToken(String quizId) {
        super(null);
        this.quizId = quizId;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public String getPrincipal() {
        return quizId;
    }
}
