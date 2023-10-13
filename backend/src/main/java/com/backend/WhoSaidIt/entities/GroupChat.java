package com.backend.WhoSaidIt.entities;

import com.backend.WhoSaidIt.DTOs.GroupChatDTO;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.GenerationType.SEQUENCE;

@Entity
@Table(
        name = "groupChats"
)
public class GroupChat {

    @Id
    @SequenceGenerator(name = "gc_sequence", sequenceName = "gc_sequence", allocationSize = 1)
    @GeneratedValue(strategy = SEQUENCE, generator = "gc_sequence")
    @Column(name = "groupChatId", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userId", referencedColumnName = "userId", nullable = false)
    @JsonManagedReference
    private User user;

    @OneToMany(mappedBy = "groupChat")
    @JsonBackReference
    private List<Participant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "groupChat")
    @JsonBackReference
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "groupChat")
    @JsonBackReference
    private List<Quiz> quizzes = new ArrayList<>();

    @Column(name = "groupChatName", columnDefinition = "TEXT", nullable = false)
    private String groupChatName;

    @Column(name = "fileName", columnDefinition = "TEXT", nullable = false)
    private String fileName;

    public GroupChat() {}

    public GroupChat(User user, String groupChatName, String fileName) {
        this.user = user;
        this.groupChatName = groupChatName;
        this.fileName = fileName;
    }

    public Long getId() { return id; }

    public User getUser() { return user; }

    public List<Quiz> getQuizzes() { return quizzes; }

    public String getGroupChatName() { return groupChatName; }

    public String getFileName() { return fileName; }

    public GroupChatDTO toDTO() {
        return new GroupChatDTO(
                this.getId(),
                this.getGroupChatName(),
                this.getFileName()
        );
    }
}
