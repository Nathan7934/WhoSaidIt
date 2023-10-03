package com.backend.WhoSaidIt.DTOs.leaderboard;

public record SurvivalEntryDTO(
        Long id,
        String playerName,
        Integer streak,
        Integer skipsUsed
) implements LeaderboardEntryDTO {}
