package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.ParticipantDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import com.backend.WhoSaidIt.repositories.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final MessageService messageService;

    public ParticipantService(ParticipantRepository participantRepository, MessageService messageService) {
        this.participantRepository = participantRepository;
        this.messageService = messageService;
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

    public Participant saveParticipant(GroupChat groupChat, String name) {
        Participant participant = new Participant(groupChat, name);
        participantRepository.save(participant);
        return participant;
    }

    @Transactional
    public void deleteParticipant(long participantId) {
        Participant participant = participantRepository.findById(participantId).orElseThrow(
                () -> new DataNotFoundException("Participant with id " + participantId + " not found.")
        );

        // Iterate through the participant's messages and call the messageService's delete method, which will
        // also remove the associations between the deleted messages and any quizzes they were in.
        List<Message> messages = new ArrayList<>(participant.getMessages());
        for (Message message : messages) {
            messageService.deleteMessage(message.getId());
        }
        participantRepository.delete(participant);
    }

    // Used in the auth_managers to check the authenticated user's ownership rights
    public boolean isOwnedBy(long participantId, long userId) {
        Participant participant = participantRepository.findById(participantId).orElseThrow(
                () -> new DataNotFoundException("Participant with id " + participantId + " not found.")
        );
        return participant.getGroupChat().getUser().getId() == userId;
    }
}
