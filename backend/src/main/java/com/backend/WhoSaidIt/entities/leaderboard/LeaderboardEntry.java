package com.backend.WhoSaidIt.entities.leaderboard;

import com.backend.WhoSaidIt.DTOs.leaderboard.LeaderboardEntryDTO;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import static jakarta.persistence.GenerationType.SEQUENCE;

@Entity
@Table(
        name = "leaderboardEntries"
)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "quizType")
public abstract class LeaderboardEntry {

    @Id
    @SequenceGenerator(name = "leaderboard_sequence", sequenceName = "leaderboard_sequence", allocationSize = 1)
    @GeneratedValue(strategy = SEQUENCE, generator = "leaderboard_sequence")
    @Column(name = "leaderboardEntryId", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quizId", referencedColumnName = "quizId", nullable = false)
    @JsonManagedReference
    private Quiz quiz;

    @Column(name = "playerName", columnDefinition = "TEXT", nullable = false)
    private String playerName;

    public LeaderboardEntry() {}

    public LeaderboardEntry(Quiz quiz, String playerName) {
        this.quiz = quiz;
        this.playerName = playerName;
    }

    public Long getId() { return id; }

    public String getPlayerName() { return playerName; }

    public Quiz getQuiz() { return quiz; }

    public abstract LeaderboardEntryDTO toDTO();
}
