package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.quiz.QuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.SurvivalQuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.TimeAttackQuizDTO;
import com.backend.WhoSaidIt.controllers.QuizController;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.entities.quiz.SurvivalQuiz;
import com.backend.WhoSaidIt.entities.quiz.TimeAttackQuiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final GroupChatRepository groupChatRepository;
    private final MessageRepository messageRepository;

    public QuizService(
            QuizRepository quizRepository,
            GroupChatRepository groupChatRepository,
            MessageRepository messageRepository
    ) {
        this.quizRepository = quizRepository;
        this.groupChatRepository = groupChatRepository;
        this.messageRepository = messageRepository;
    }

    public List<QuizDTO> getAllQuizzes(long groupChatId) {
        List<Quiz> quizzes = quizRepository.findByGroupChatId(groupChatId);
        return quizzes.stream().map(Quiz::toDTO).toList();
    }

    public QuizDTO getQuiz(long id) {
        Quiz quiz = quizRepository.findById(id)
                    .orElseThrow(() -> new DataNotFoundException("Quiz with id " + id + " not found."));
        return quiz.toDTO();
    }

    public TimeAttackQuizDTO createTimeAttackQuiz(long groupChatId, QuizController.TimeAttackQuizPostRequest taQuiz) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId)
                .orElseThrow(() -> new DataNotFoundException("Group chat with id " + groupChatId + " not found."));
        TimeAttackQuiz quiz = new TimeAttackQuiz(
                groupChat, taQuiz.quizName(), taQuiz.description(), taQuiz.numberOfQuestions(),
                taQuiz.initialQuestionScore(), taQuiz.penaltyPerSecond(), taQuiz.wrongAnswerPenalty()
        );
        return quizRepository.save(quiz).toDTO();
    }

    public SurvivalQuizDTO createSurvivalQuiz(long groupChatId, QuizController.SurvivalQuizPostRequest sQuiz) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId)
                .orElseThrow(() -> new DataNotFoundException("Group chat with id " + groupChatId + " not found."));
        SurvivalQuiz quiz = new SurvivalQuiz(groupChat, sQuiz.quizName(), sQuiz.description(), sQuiz.numberOfSkips());
        return quizRepository.save(quiz).toDTO();
    }

    @Transactional
    public void addMessagesToQuiz(long quizId, List<Long> messageIds) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));
        List<Message> messages = messageRepository.findAllById(messageIds);
        if (messages.size() != messageIds.size()) {
            throw new DataNotFoundException("One or more messages with the given ids were not found.");
        }

        // Since the method is transactional, the database will be synchronized when the method returns.
        for (Message message : messages) {
            quiz.getMessagesInQuiz().add(message);
            message.getQuizzes().add(quiz);
        }
    }

    @Transactional
    public void removeMessagesFromQuiz(long quizId, List<Long> messageIds) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));

        List<Message> quizMessages = quiz.getMessagesInQuiz();
        int preSize = quizMessages.size();
        quizMessages.removeIf(message -> messageIds.contains(message.getId()));

        // Check if the amount of messages removed matches the number of messageIds given.
        if (preSize - quizMessages.size() != messageIds.size()) {
            throw new DataNotFoundException("One or more messages with the given ids were not found.");
        }
    }

    @Transactional
    public void deleteQuiz(long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + id + " not found."));

        // We remove the quiz association from any messages that may be used in it to preserve referential integrity
        for (Message message : quiz.getMessagesInQuiz()) {
            message.getQuizzes().remove(quiz);
        }

        quizRepository.deleteById(id);
    }

    // Used in the auth_managers to check the authenticated user's ownership rights
    public boolean isOwnedBy(long quizId, long userId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(
                () -> new DataNotFoundException("Quiz with id " + quizId + " not found.")
        );
        return quiz.getGroupChat().getUser().getId() == userId;
    }
}
