package com.backend.WhoSaidIt.DTOs.quiz.info;

import com.backend.WhoSaidIt.DTOs.ParticipantDTO;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = TimeAttackQuizInfoDTO.class, name = "TIME_ATTACK"),
        @JsonSubTypes.Type(value = SurvivalQuizInfoDTO.class, name = "SURVIVAL")
})
public sealed interface QuizInfoDTO permits TimeAttackQuizInfoDTO, SurvivalQuizInfoDTO {
    Long id();
    String quizName();
    String description();
    String groupChatName();
    List<ParticipantDTO> participants();
}
