package com.backend.WhoSaidIt.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

    public void setUser(User user) { this.user = user; }

    public List<Participant> getParticipants() { return participants; }

    public void setParticipants(List<Participant> participants) { this.participants = participants; }

    public List<Message> getMessages() { return messages; }

    public void setMessages(List<Message> messages) { this.messages = messages; }

    public String getGroupChatName() { return groupChatName; }

    public void setGroupChatName(String groupChatName) { this.groupChatName = groupChatName; }

    @Override
    public String toString() {
        return "GroupChat{" +
                "id=" + id +
                ", user=" + user +
                ", participants=" + participants +
                ", messages=" + messages +
                ", groupChatName='" + groupChatName + '\'' +
                '}';
    }
}
