package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.ParticipantRepository;
import org.springframework.stereotype.Service;

@Service
public class ParticipantService {

    private final ParticipantRepository repository;

    public ParticipantService(ParticipantRepository repository) {
        this.repository = repository;
    }

    public Participant get(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new DataNotFoundException("Participant with id " + id + " not found.")
        );
    }

    public void remove(Long id) {
        repository.deleteById(id);
    }

    public Participant save(GroupChat groupChat, String name) {
        Participant participant = new Participant(groupChat, name);
        repository.save(participant);
        return participant;
    }
}
