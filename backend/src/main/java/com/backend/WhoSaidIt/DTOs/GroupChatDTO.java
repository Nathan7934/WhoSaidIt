package com.backend.WhoSaidIt.DTOs;

import java.time.LocalDateTime;

public record GroupChatDTO(
        Long id,
        String groupChatName,
        LocalDateTime uploadDate,
        String fileName
) {}
