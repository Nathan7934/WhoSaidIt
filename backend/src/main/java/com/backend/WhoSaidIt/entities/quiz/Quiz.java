package com.backend.WhoSaidIt.entities.quiz;

import com.backend.WhoSaidIt.DTOs.quiz.QuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.info.QuizInfoDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.leaderboard.LeaderboardEntry;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes", indexes = {
    @Index(name = "idx_url_token", columnList = "urlToken", unique = true)
})
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

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<LeaderboardEntry> leaderboardEntries = new ArrayList<>();

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "messagesInQuiz",
            joinColumns = @JoinColumn(name = "quizId"),
            inverseJoinColumns = @JoinColumn(name = "messageId")
    )
    @JsonIgnore
    private List<Message> messagesInQuiz = new ArrayList<>();

    @Column(name = "quizName", columnDefinition = "TEXT", nullable = false)
    private String quizName;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @CreationTimestamp
    @Column(name = "createdDate", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE", nullable = false)
    private LocalDateTime createdDate;

    // Authentication token used to access the quiz without an account
    @Column(name = "shareableAccessToken", columnDefinition = "TEXT")
    private String shareableAccessToken;

    // A shorter alias for the quiz jwt, used in shareable links
    @Column(name = "urlToken", columnDefinition = "TEXT", unique = true)
    private String urlToken;

    public Quiz() {}

    public Quiz(GroupChat groupChat, String quizName, String description) {
        this.groupChat = groupChat;
        this.quizName = quizName;
        this.description = description;
        this.urlToken = null;
        this.shareableAccessToken = null;
    }

    public Long getId() { return id; }

    public GroupChat getGroupChat() { return groupChat; }

    public List<Message> getMessagesInQuiz() { return messagesInQuiz; }

    public String getQuizName() { return quizName; }

    public String getDescription() { return description; }

    public LocalDateTime getCreatedDate() { return createdDate; }

    public String getUrlToken() { return urlToken; }

    public String getShareableAccessToken() { return shareableAccessToken; }

    public void setUrlToken(String urlToken) { this.urlToken = urlToken; }

    public void setShareableAccessToken(String shareableAccessToken) { this.shareableAccessToken = shareableAccessToken; }
    public abstract QuizDTO toDTO();

    public abstract QuizInfoDTO toInfoDTO();
}
