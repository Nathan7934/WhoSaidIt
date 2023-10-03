package com.backend.WhoSaidIt.DTOs.quiz;

public record TimeAttackQuizDTO(
        Long id,
        String quizName,
        String description,
        Integer numberOfQuestions,
        Integer initialQuestionScore,
        Integer penaltyPerSecond,
        Integer wrongAnswerPenalty
) implements QuizDTO {}
