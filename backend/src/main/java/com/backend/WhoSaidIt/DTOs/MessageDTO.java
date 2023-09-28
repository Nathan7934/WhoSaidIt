package com.backend.WhoSaidIt.DTOs;

import java.time.LocalDateTime;

public record MessageDTO(
        Long id,
        String content,
        LocalDateTime timestamp
) {}
