package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.MessageRepository;
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

    public Message getRandom(long groupChatId, List<Long> excludedMessageIds) {
        long messageCount = messageRepository.countByGroupChatId(groupChatId);
        Random rand = new Random();
        long id = rand.nextInt((int) messageCount) + 1;
        Message randomMessage = messageRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Random generated an invalid id."));
        while (excludedMessageIds.contains(randomMessage.getId())) {
            id = rand.nextInt((int) messageCount) + 1;
            randomMessage = messageRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Random generated an invalid id."));
        }
        return randomMessage;
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
