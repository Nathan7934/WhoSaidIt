package com.backend.WhoSaidIt.exceptions;

public class InvalidTokenTypeException extends RuntimeException {
    public InvalidTokenTypeException(String message) {
        super(message);
    }
}
