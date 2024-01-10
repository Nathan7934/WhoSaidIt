package com.backend.WhoSaidIt.DTOs.quiz.info;

import com.backend.WhoSaidIt.DTOs.ParticipantDTO;
import com.backend.WhoSaidIt.DTOs.quiz.SurvivalQuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.TimeAttackQuizDTO;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = TimeAttackQuizDTO.class, name = "TIME_ATTACK"),
        @JsonSubTypes.Type(value = SurvivalQuizDTO.class, name = "SURVIVAL")
})
public sealed interface QuizInfoDTO permits TimeAttackQuizInfoDTO, SurvivalQuizInfoDTO {
    Long id();
    String quizName();
    String description();
    String groupChatName();
    List<ParticipantDTO> participants();
}
