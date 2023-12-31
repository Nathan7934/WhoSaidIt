package com.backend.WhoSaidIt.entities;

import com.backend.WhoSaidIt.DTOs.ParticipantDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @JsonManagedReference
    private GroupChat groupChat;

    @OneToMany(mappedBy = "participant")
    @JsonBackReference
    private List<Message> messages = new ArrayList<Message>();

    @Column(name = "name", nullable = false)
    private String name;

    public Participant() {}

    public Participant(GroupChat groupChat, String name) {
        this.groupChat = groupChat;
        this.name = name;
    }

    public Long getId() { return id; }

    public GroupChat getGroupChat() { return groupChat; }

    public List<Message> getMessages() { return messages; }

    public void setGroupChat(GroupChat groupChat) { this.groupChat = groupChat; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public ParticipantDTO toDTO() {
        return new ParticipantDTO(
                this.id,
                this.name,
                this.messages.size()
        );
    }
}
