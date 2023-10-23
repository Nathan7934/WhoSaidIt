package com.backend.WhoSaidIt.DTOs;

public record AuthenticationResponseDTO(
        Long user_id,
        String access_token,
        String refresh_token
) {}
