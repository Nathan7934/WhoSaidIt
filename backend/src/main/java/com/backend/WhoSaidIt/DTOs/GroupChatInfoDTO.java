package com.backend.WhoSaidIt.DTOs;

import com.backend.WhoSaidIt.DTOs.quiz.QuizDTO;

import java.time.LocalDateTime;
import java.util.List;

// This record combines more information than a typical DTO because we are compiling information from multiple tables.
// These values are meant for display on the frontend dashboard.
public record GroupChatInfoDTO(
        Long id,
        String groupChatName,
        LocalDateTime uploadDate,
        Integer numParticipants,
        Integer numMessages,
        List<QuizDTO> quizzes
) {}
