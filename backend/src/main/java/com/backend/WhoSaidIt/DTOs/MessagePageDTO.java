package com.backend.WhoSaidIt.DTOs;

import java.util.List;

public record MessagePageDTO(
        int pageNumber,
        int totalPages,
        long totalMessages,
        boolean hasNext,
        boolean hasPrevious,
        List<MessageDTO> messages
) {}
