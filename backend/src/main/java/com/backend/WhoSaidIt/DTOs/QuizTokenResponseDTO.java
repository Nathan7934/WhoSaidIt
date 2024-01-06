package com.backend.WhoSaidIt.DTOs;

public record QuizTokenResponseDTO(
        String access_token,
        String url_token
) {}
