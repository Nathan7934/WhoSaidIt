package com.backend.WhoSaidIt.entities.leaderboard;

import com.backend.WhoSaidIt.DTOs.leaderboard.SurvivalEntryDTO;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.util.UUID;

@Entity
@DiscriminatorValue("SURVIVAL")
public class SurvivalEntry extends LeaderboardEntry {

    @Column(name = "streak", columnDefinition = "INT")
    private Integer streak;

    @Column(name = "skipsUsed", columnDefinition = "INT")
    private Integer skipsUsed;

    public SurvivalEntry() {}

    public SurvivalEntry(Quiz quiz, String playerName, UUID playerUUID, Integer streak, Integer skipsUsed) {
        super(quiz, playerName, playerUUID);
        this.streak = streak;
        this.skipsUsed = skipsUsed;
    }

    public Integer getStreak() { return streak; }

    public Integer getSkipsUsed() { return skipsUsed; }

    public void setStreak(Integer streak) { this.streak = streak; }

    public void setSkipsUsed(Integer skipsUsed) { this.skipsUsed = skipsUsed; }

    public SurvivalEntryDTO toDTO() {
        return new SurvivalEntryDTO(
                this.getId(),
                this.getPlayerName(),
                this.getStreak(),
                this.getSkipsUsed()
        );
    }
}
