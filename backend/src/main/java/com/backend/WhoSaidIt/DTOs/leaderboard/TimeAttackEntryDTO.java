package com.backend.WhoSaidIt.DTOs.leaderboard;

public record TimeAttackEntryDTO(
        Long id,
        String playerName,
        Integer score,
        Double timeTaken,
        Double averageTimePerQuestion
) implements LeaderboardEntryDTO {}
