package com.backend.WhoSaidIt.DTOs;

public record UserDTO(
        Long id,
        String username,
        String email,
        Long focusedGroupChatId
) {}
