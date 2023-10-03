package com.backend.WhoSaidIt.DTOs.leaderboard;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = TimeAttackEntryDTO.class, name = "TIME_ATTACK"),
        @JsonSubTypes.Type(value = SurvivalEntryDTO.class, name = "SURVIVAL")
})
public sealed interface LeaderboardEntryDTO permits SurvivalEntryDTO, TimeAttackEntryDTO {
    Long id();
    String playerName();
}
