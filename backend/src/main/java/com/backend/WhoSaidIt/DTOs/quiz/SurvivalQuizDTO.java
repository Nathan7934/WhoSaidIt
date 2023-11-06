package com.backend.WhoSaidIt.DTOs.quiz;

import java.time.LocalDateTime;

public record SurvivalQuizDTO(
        Long id,
        String quizName,
        String description,
        LocalDateTime createdDate,
        Boolean hasSpecifiedMessages,
        Integer numberOfSkips
) implements QuizDTO {}
