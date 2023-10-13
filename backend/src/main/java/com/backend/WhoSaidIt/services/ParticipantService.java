package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.ParticipantDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public ParticipantDTO getParticipant(long participantId) {
        Participant participant = participantRepository.findById(participantId).orElseThrow(
                () -> new DataNotFoundException("Participant with id " + participantId + " not found.")
        );
        return participant.toDTO();
    }

    public List<ParticipantDTO> getGroupChatParticipants(long groupChatId) {
        return participantRepository.findByGroupChatId(groupChatId).stream().map(Participant::toDTO).toList();
    }

    @Transactional
    public void updateParticipantName(long participantId, String name) {
        Participant participant = participantRepository.findById(participantId).orElseThrow(
                () -> new DataNotFoundException("Participant with id " + participantId + " not found.")
        );
        participant.setName(name);
    }

    public Participant save(GroupChat groupChat, String name) {
        Participant participant = new Participant(groupChat, name);
        participantRepository.save(participant);
        return participant;
    }

    public void deleteParticipant(long participantId) {
        participantRepository.deleteById(participantId);
    }

    // Used in the auth_managers to check the authenticated user's ownership rights
    public boolean isOwnedBy(long participantId, long userId) {
        Participant participant = participantRepository.findById(participantId).orElseThrow(
                () -> new DataNotFoundException("Participant with id " + participantId + " not found.")
        );
        return participant.getGroupChat().getUser().getId() == userId;
    }
}
