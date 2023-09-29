package com.backend.WhoSaidIt.DTOs;

import java.time.LocalDateTime;

public record MessageDTO(
        Long id,
        ParticipantDTO sender,
        String content,
        LocalDateTime timestamp
) {}
