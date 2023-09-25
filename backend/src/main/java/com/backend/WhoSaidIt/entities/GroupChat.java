package com.backend.WhoSaidIt.entities;

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
    private User user;

    @OneToMany(mappedBy = "groupChat")
    private List<Participant> participants = new ArrayList<Participant>();

    @OneToMany(mappedBy = "groupChat")
    private List<Message> messages = new ArrayList<Message>();

    @Column(name = "groupChatName", columnDefinition = "TEXT", nullable = false)
    private String groupChatName;

    public GroupChat() {}

    public GroupChat(Long id, User user, String groupChatName) {
        this.id = id;
        this.user = user;
        this.groupChatName = groupChatName;
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
