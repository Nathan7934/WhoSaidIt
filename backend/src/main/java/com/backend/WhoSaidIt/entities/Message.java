package com.backend.WhoSaidIt.entities;

import jakarta.persistence.*;

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
    private Participant participant;

    @ManyToOne
    @JoinColumn(name = "groupChatId", referencedColumnName = "groupChatId", nullable = false)
    private GroupChat groupChat;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    public Message() {}

    public Message(Long id, Participant participant, GroupChat groupChat, String content) {
        this.id = id;
        this.participant = participant;
        this.groupChat = groupChat;
        this.content = content;
    }

    public Long getId() { return id; }

    public Participant getParticipant() { return participant; }

    public void setParticipant(Participant participant) { this.participant = participant; }

    public GroupChat getGroupChat() { return groupChat; }

    public void setGroupChat(GroupChat groupChat) { this.groupChat = groupChat; }

    public String getContent() { return content; }

    public void setContent(String content) { this.content = content; }

    @Override
    public String toString() {
        return "Message{" +
                "id=" + id +
                ", participant=" + participant +
                ", groupChat=" + groupChat +
                ", content='" + content + '\'' +
                '}';
    }
}
