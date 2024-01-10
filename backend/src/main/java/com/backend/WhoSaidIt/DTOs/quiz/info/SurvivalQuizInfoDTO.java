package com.backend.WhoSaidIt.DTOs.quiz.info;

import com.backend.WhoSaidIt.DTOs.ParticipantDTO;

import java.util.List;

public record SurvivalQuizInfoDTO(
        Long id,
        String quizName,
        String description,
        String groupChatName,
        List<ParticipantDTO> participants,
        Integer numberOfSkips
) implements QuizInfoDTO {}
