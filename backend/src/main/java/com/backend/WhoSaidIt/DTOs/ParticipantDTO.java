package com.backend.WhoSaidIt.DTOs;

public record ParticipantDTO(
        Long id,
        String name,
        Integer numberOfMessages
) {}
