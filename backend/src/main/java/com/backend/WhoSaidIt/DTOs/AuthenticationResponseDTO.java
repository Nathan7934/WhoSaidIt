package com.backend.WhoSaidIt.DTOs;

public record AuthenticationResponseDTO(
        String access_token,
        String refresh_token
) {}
