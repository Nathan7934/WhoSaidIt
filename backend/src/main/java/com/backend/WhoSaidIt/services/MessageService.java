package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.MessageDTO;
import com.backend.WhoSaidIt.DTOs.ParticipantDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public MessageDTO getRandom(long groupChatId, List<Long> excludedMessageIds) {
        long messageCount = messageRepository.countByGroupChatId(groupChatId);
        Random rand = new Random();
        long id = rand.nextInt((int) messageCount) + 1;
        Message rMessage = messageRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Random generated an invalid id."));
        while (excludedMessageIds.contains(rMessage.getId())) {
            id = rand.nextInt((int) messageCount) + 1;
            rMessage = messageRepository.findById(id)
                    .orElseThrow(() -> new DataNotFoundException("Random generated an invalid id."));
        }
        return new MessageDTO(
                rMessage.getId(),
                new ParticipantDTO(
                        rMessage.getParticipant().getId(),
                        rMessage.getParticipant().getName()
                ),
                rMessage.getContent(),
                rMessage.getTimestamp()
        );
    }

    public Page<MessageDTO> getPaginatedMessages(long groupChatId, Pageable pageable) {
        Page<Message> messages = messageRepository.findByGroupChatId(groupChatId, pageable);
        return messages.map(message -> new MessageDTO(
                message.getId(),
                new ParticipantDTO(
                        message.getParticipant().getId(),
                        message.getParticipant().getName()
                ),
                message.getContent(),
                message.getTimestamp()
        ));
    }

    public Message get(long id) {
        return messageRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("Message with id " + id + " not found.")
        );
    }

    public void remove(long id) {
        messageRepository.deleteById(id);
    }

    public Message save(Participant participant, GroupChat groupChat, String content, LocalDateTime timestamp) {
        Message message = new Message(participant, groupChat, content, timestamp);
        messageRepository.save(message);
        return message;
    }
}
