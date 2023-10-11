package com.backend.WhoSaidIt.entities;

import com.backend.WhoSaidIt.DTOs.MessageDTO;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.GenerationType.SEQUENCE;

@Entity
@Table(
        name = "messages"
)
public class Message {

    @Id
    @SequenceGenerator(name = "message_sequence", sequenceName = "message_sequence", allocationSize = 1)
    @GeneratedValue(strategy = SEQUENCE, generator = "message_sequence")
    @Column(name = "messageId", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "participantId", referencedColumnName = "participantId", nullable = false)
    @JsonManagedReference
    private Participant participant;

    @ManyToOne
    @JoinColumn(name = "groupChatId", referencedColumnName = "groupChatId", nullable = false)
    @JsonManagedReference
    private GroupChat groupChat;

    @ManyToMany(mappedBy = "messagesInQuiz")
    @JsonIgnore
    private List<Quiz> quizzes = new ArrayList<>();

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "timestamp", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE", nullable = false)
    private LocalDateTime timestamp;

    public Message() {}

    public Message(Participant participant, GroupChat groupChat, String content, LocalDateTime timestamp) {
        this.participant = participant;
        this.groupChat = groupChat;
        this.content = content;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }

    public Participant getParticipant() { return participant; }

    public void setParticipant(Participant participant) { this.participant = participant; }

    public GroupChat getGroupChat() { return groupChat; }

    public void setGroupChat(GroupChat groupChat) { this.groupChat = groupChat; }

    public List<Quiz> getQuizzes() { return quizzes; }

    public String getContent() { return content; }

    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }

    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public MessageDTO toDTO() {
        return new MessageDTO(
                this.id,
                this.participant.toDTO(),
                this.content,
                this.timestamp
        );
    }
}
