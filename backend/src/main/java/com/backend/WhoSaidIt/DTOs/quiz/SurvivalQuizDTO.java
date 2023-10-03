package com.backend.WhoSaidIt.DTOs.quiz;

public record SurvivalQuizDTO(
        Long id,
        String quizName,
        String description,
        Integer numberOfSkips
) implements QuizDTO {}
