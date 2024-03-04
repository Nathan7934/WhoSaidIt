package com.backend.WhoSaidIt.entities.leaderboard;

import com.backend.WhoSaidIt.DTOs.leaderboard.TimeAttackEntryDTO;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.util.UUID;

@Entity
@DiscriminatorValue("TIME_ATTACK")
public class TimeAttackEntry extends LeaderboardEntry {

    @Column(name = "score", columnDefinition = "INT")
    private Integer score;

    @Column(name = "timeTaken", columnDefinition = "DOUBLE PRECISION")
    private Double timeTaken;

    @Column(name = "averageTimePerQuestion", columnDefinition = "DOUBLE PRECISION")
    private Double averageTimePerQuestion;

    public TimeAttackEntry() {}

    public TimeAttackEntry(Quiz quiz, String playerName, UUID playerUUID, Integer score,
                           Double timeTaken, Double averageTimePerQuestion) {
        super(quiz, playerName, playerUUID);
        this.score = score;
        this.timeTaken = timeTaken;
        this.averageTimePerQuestion = averageTimePerQuestion;
    }

    public Integer getScore() { return score; }

    public Double getTimeTaken() { return timeTaken; }

    public Double getAverageTimePerQuestion() { return averageTimePerQuestion; }

    public void setScore(Integer score) { this.score = score; }

    public void setTimeTaken(Double timeTaken) { this.timeTaken = timeTaken; }

    public void setAverageTimePerQuestion(Double averageTimePerQuestion) { this.averageTimePerQuestion = averageTimePerQuestion; }

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
