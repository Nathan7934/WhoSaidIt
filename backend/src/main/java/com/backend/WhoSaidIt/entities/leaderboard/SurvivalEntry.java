package com.backend.WhoSaidIt.entities.leaderboard;

import com.backend.WhoSaidIt.entities.quiz.Quiz;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SURVIVAL")
public class SurvivalEntry extends LeaderboardEntry {

    @Column(name = "score", columnDefinition = "INT", nullable = false)
    private Integer streak;

    @Column(name = "skipsUsed", columnDefinition = "INT", nullable = false)
    private Integer skipsUsed;

    public SurvivalEntry() {}

    public SurvivalEntry(Quiz quiz, String playerName, Integer streak, Integer skipsUsed) {
        super(quiz, playerName);
        this.streak = streak;
        this.skipsUsed = skipsUsed;
    }
}
