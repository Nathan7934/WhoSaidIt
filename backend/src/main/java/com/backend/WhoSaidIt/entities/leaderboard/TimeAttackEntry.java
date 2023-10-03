package com.backend.WhoSaidIt.entities.leaderboard;

import com.backend.WhoSaidIt.DTOs.leaderboard.TimeAttackEntryDTO;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TIME_ATTACK")
public class TimeAttackEntry extends LeaderboardEntry {

    @Column(name = "score", columnDefinition = "INT", nullable = false)
    private Integer score;

    @Column(name = "timeTaken", columnDefinition = "INT", nullable = false)
    private Integer timeTaken;

    @Column(name = "averageTimePerQuestion", columnDefinition = "INT", nullable = false)
    private Integer averageTimePerQuestion;

    public TimeAttackEntry() {}

    public TimeAttackEntry(Quiz quiz, String playerName, Integer score,
                           Integer timeTaken, Integer averageTimePerQuestion) {
        super(quiz, playerName);
        this.score = score;
        this.timeTaken = timeTaken;
        this.averageTimePerQuestion = averageTimePerQuestion;
    }

    public Integer getScore() { return score; }

    public Integer getTimeTaken() { return timeTaken; }

    public Integer getAverageTimePerQuestion() { return averageTimePerQuestion; }

    public TimeAttackEntryDTO toDTO() {
        return new TimeAttackEntryDTO(
                this.getId(),
                this.getPlayerName(),
                this.getScore(),
                this.getTimeTaken(),
                this.getAverageTimePerQuestion()
        );
    }
}
