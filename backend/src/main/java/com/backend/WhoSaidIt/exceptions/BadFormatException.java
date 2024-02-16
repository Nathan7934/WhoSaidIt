package com.backend.WhoSaidIt.exceptions;

public class BadFormatException extends RuntimeException {
    public BadFormatException(String message) {
        super(message);
    }
}