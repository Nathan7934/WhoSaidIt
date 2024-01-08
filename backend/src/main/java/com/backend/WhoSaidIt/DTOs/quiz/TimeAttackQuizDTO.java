package com.backend.WhoSaidIt.DTOs.quiz;

import java.time.LocalDateTime;

public record TimeAttackQuizDTO(
        Long id,
        String quizName,
        String description,
        LocalDateTime createdDate,
        Integer numberOfQuestions,
        Integer initialQuestionScore,
        Integer penaltyPerSecond,
        Integer wrongAnswerPenalty
) implements QuizDTO {}
