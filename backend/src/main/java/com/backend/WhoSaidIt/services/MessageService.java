package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessageService {

    private final MessageRepository repository;

    public MessageService(MessageRepository repository) {
        this.repository = repository;
    }

    public Message get(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void remove(Long id) {
        repository.deleteById(id);
    }

    public Message save(Participant participant, GroupChat groupChat, String content, LocalDateTime timestamp) {
        Message message = new Message(participant, groupChat, content, timestamp);
        repository.save(message);
        return message;
    }
}
