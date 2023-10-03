package com.backend.WhoSaidIt.DTOs.leaderboard;

public record TimeAttackEntryDTO(
        Long id,
        String playerName,
        Integer score,
        Integer timeTaken,
        Integer averageTimePerQuestion
) implements LeaderboardEntryDTO {}
