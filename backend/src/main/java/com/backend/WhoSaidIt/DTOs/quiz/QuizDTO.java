package com.backend.WhoSaidIt.DTOs.quiz;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = TimeAttackQuizDTO.class, name = "TIME_ATTACK"),
        @JsonSubTypes.Type(value = SurvivalQuizDTO.class, name = "SURVIVAL")
})
public sealed interface QuizDTO permits TimeAttackQuizDTO, SurvivalQuizDTO {
    Long id();
    String quizName();
    String description();

    Boolean hasSpecifiedMessages();
}
