package com.backend.WhoSaidIt.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.GenerationType.SEQUENCE;

@Entity
@Table(
        name = "participants"
)
public class Participant {

    @Id
    @SequenceGenerator(name = "participant_sequence", sequenceName = "participant_sequence", allocationSize = 1)
    @GeneratedValue(strategy = SEQUENCE, generator = "participant_sequence")
    @Column(name = "participantId", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "groupChatId", nullable = false)
    private GroupChat groupChat;

    @OneToMany(mappedBy = "participant")
    private List<Message> messages = new ArrayList<Message>();

    @Column(name = "name", nullable = false)
    private String name;

    public Participant() {}

    public Participant(Long id, GroupChat groupChat, String name) {
        this.id = id;
        this.groupChat = groupChat;
        this.name = name;
    }

    public Long getId() { return id; }

    public GroupChat getGroupChat() { return groupChat; }

    public void setGroupChat(GroupChat groupChat) { this.groupChat = groupChat; }

    public List<Message> getMessages() { return messages; }

    public void setMessages(List<Message> messages) { this.messages = messages; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    @Override
    public String toString() {
        return "Participant{" +
                "id=" + id +
                ", groupChat=" + groupChat +
                ", messages=" + messages +
                ", name='" + name + '\'' +
                '}';
    }
}
