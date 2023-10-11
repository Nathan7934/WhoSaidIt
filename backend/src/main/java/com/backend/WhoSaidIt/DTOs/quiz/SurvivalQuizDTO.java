package com.backend.WhoSaidIt.DTOs.quiz;

public record SurvivalQuizDTO(
        Long id,
        String quizName,
        String description,
        Boolean hasSpecifiedMessages,
        Integer numberOfSkips
) implements QuizDTO {}
