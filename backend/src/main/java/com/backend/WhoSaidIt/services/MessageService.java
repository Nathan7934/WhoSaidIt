package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.MessageDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final QuizRepository quizRepository;

    public MessageService(MessageRepository messageRepository, QuizRepository quizRepository) {
        this.messageRepository = messageRepository;
        this.quizRepository = quizRepository;
    }

    public MessageDTO getRandomQuizMessage(long quizId, List<Long> excludedMessageIds) {
        long quizMessageCount = messageRepository.countByQuizId(quizId);

        // If the quiz has no messages, or if we have exhausted all specified messages, we instead return a random
        // message from the group chat.
        Message rMessage;
        Pageable oiPageable = PageRequest.of(0, 1); // oi = one item; required for SQL randomization
        if (quizMessageCount == 0 || excludedMessageIds.size() >= quizMessageCount) {
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));
            long groupChatId = quiz.getGroupChat().getId();
            List<Message> oiPage = excludedMessageIds.isEmpty()
                    ? messageRepository.findRandomMessageByGroupChatId(groupChatId, oiPageable).getContent()
                    : messageRepository.findRandomMessageByGroupChatId(groupChatId, excludedMessageIds, oiPageable).getContent();
            if (oiPage.isEmpty()) {
                throw new DataNotFoundException("No messages found in group chat with id " + groupChatId);
            }
            rMessage = oiPage.get(0);
        } else {
            rMessage = excludedMessageIds.isEmpty()
                    ? messageRepository.findRandomMessageByQuizId(quizId, oiPageable).getContent().get(0)
                    : messageRepository.findRandomMessageByQuizId(quizId, excludedMessageIds, oiPageable).getContent().get(0);
        }

        return rMessage.toDTO();
    }

    public Page<MessageDTO> getPaginatedGroupChatMessages(long groupChatId, Pageable pageable) {
        Page<Message> messages = messageRepository.findByGroupChatId(groupChatId, pageable);
        return messages.map(Message::toDTO);
    }

    // Method overload for filtering messages by participantId
    public Page<MessageDTO> getPaginatedGroupChatMessages(long groupChatId, long participantId, Pageable pageable) {
        Page<Message> messages = messageRepository.findByGroupChatIdAndParticipantId(groupChatId, participantId, pageable);
        return messages.map(Message::toDTO);
    }

    public Page<MessageDTO> getPaginatedQuizMessages(long quizId, Pageable pageable) {
        Page<Message> messages = messageRepository.findByQuizId(quizId, pageable);
        return messages.map(Message::toDTO);
    }

    // Method overload for filtering messages by participantId
    public Page<MessageDTO> getPaginatedQuizMessages(long quizId, long participantId, Pageable pageable) {
        Page<Message> messages = messageRepository.findByQuizIdAndParticipantId(quizId, participantId, pageable);
        return messages.map(Message::toDTO);
    }

    public MessageDTO getMessage(long id) {
        Message message = messageRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("Message with id " + id + " not found.")
        );
        return message.toDTO();
    }

    public List<MessageDTO> getMessagesByQuizId(long quizId) {
        List<Message> messages = messageRepository.findByQuizId(quizId);
        return messages.stream().map(Message::toDTO).toList();
    }

    @Transactional
    public void deleteMessages(List<Long> messageIds) {
        for (long id : messageIds) {
            deleteMessage(id);
        }
    }

    @Transactional
    public void deleteMessage(long id) {
        Message message = messageRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("Message with id " + id + " not found.")
        );

        // We remove the message from any quizzes it may be in to preserve referential integrity
        for (Quiz quiz : message.getQuizzes()) {
            quiz.getMessagesInQuiz().remove(message);
        }
        messageRepository.delete(message);
    }

    public Message saveMessage(Participant participant, GroupChat groupChat, String content, LocalDateTime timestamp) {
        Message message = new Message(participant, groupChat, content, timestamp);
        messageRepository.save(message);
        return message;
    }

    // Used in the service package's auth_managers to check the authenticated user's ownership rights
    public boolean isOwnedBy(long messageId, long userId) {
        Message message = messageRepository.findById(messageId).orElseThrow(
                () -> new DataNotFoundException("Message with id " + messageId + " not found.")
        );
        return message.getGroupChat().getUser().getId() == userId;
    }
}
