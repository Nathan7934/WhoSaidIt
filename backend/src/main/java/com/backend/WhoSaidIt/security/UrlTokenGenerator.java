package com.backend.WhoSaidIt.security;

import java.security.SecureRandom;

public class UrlTokenGenerator {

    // This class is used to generate random tokens for use in URLs.
    // The tokens are 32 characters long and contain only alphanumeric characters.
    // These tokens are extracted from a shareable link and used to authenticate users who are not logged in

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int TOKEN_LENGTH = 32;
    private static final SecureRandom random = new SecureRandom();

    public static String generateUrlToken() {
        StringBuilder token = new StringBuilder(TOKEN_LENGTH);
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            token.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return token.toString();
    }
}
