package com.backend.WhoSaidIt.security.tokens;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;

public class PasswordResetAuthenticationToken extends AbstractAuthenticationToken {
    // This class is used to represent the authentication status of a shareable JWT for a quiz.

    private final UserDetails userDetails;

    public PasswordResetAuthenticationToken(UserDetails userDetails) {
        super(null);
        this.userDetails = userDetails;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public UserDetails getPrincipal() {
        return userDetails;
    }
}