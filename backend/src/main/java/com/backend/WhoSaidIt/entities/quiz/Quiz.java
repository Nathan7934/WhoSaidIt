package com.backend.WhoSaidIt.entities.quiz;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.leaderboard.LeaderboardEntry;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quizzes"
)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "quizType")
public abstract class Quiz {

    @Id
    @SequenceGenerator(name = "quiz_sequence", sequenceName = "quiz_sequence", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "quiz_sequence")
    @Column(name = "quizId", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "groupChatId", referencedColumnName = "groupChatId", nullable = false)
    @JsonManagedReference
    private GroupChat groupChat;

    @OneToMany(mappedBy = "quiz")
    @JsonBackReference
    private List<LeaderboardEntry> leaderboardEntries = new ArrayList<>();

    @Column(name = "quizName", columnDefinition = "TEXT", nullable = false)
    private String quizName;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    public Quiz() {}

    public Quiz(GroupChat groupChat, String quizName, String description) {
        this.groupChat = groupChat;
        this.quizName = quizName;
        this.description = description;
    }
}
