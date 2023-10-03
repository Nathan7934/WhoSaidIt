package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.quiz.QuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.SurvivalQuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.TimeAttackQuizDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.entities.quiz.SurvivalQuiz;
import com.backend.WhoSaidIt.entities.quiz.TimeAttackQuiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final GroupChatRepository groupChatRepository;

    public QuizService(QuizRepository quizRepository, GroupChatRepository groupChatRepository) {
        this.quizRepository = quizRepository;
        this.groupChatRepository = groupChatRepository;
    }

    public List<QuizDTO> getAllQuizzes(long groupChatId) {
        List<Quiz> quizzes = quizRepository.findByGroupChatId(groupChatId);
        List<QuizDTO> quizDTOs = new ArrayList<>();
        for (Quiz quiz : quizzes) {
            if (quiz instanceof TimeAttackQuiz) {
                TimeAttackQuiz taQuiz = (TimeAttackQuiz) quiz;
                quizDTOs.add(taQuiz.toDTO());
            } else if (quiz instanceof SurvivalQuiz) {
                SurvivalQuiz sQuiz = (SurvivalQuiz) quiz;
                quizDTOs.add(sQuiz.toDTO());
            } else {
                throw new IllegalStateException("Quiz with id " + quiz.getId() + " has an invalid type.");
            }
        }
        return quizDTOs;
    }

    public QuizDTO getQuiz(long id) {
        Quiz quiz = quizRepository.findById(id)
                    .orElseThrow(() -> new DataNotFoundException("Quiz with id " + id + " not found."));

        // Check the type of the retrieved quiz and map it to the appropriate DTO
        if (quiz instanceof TimeAttackQuiz) {
            TimeAttackQuiz taQuiz = (TimeAttackQuiz) quiz;
            return taQuiz.toDTO();
        } else if (quiz instanceof SurvivalQuiz) {
            SurvivalQuiz sQuiz = (SurvivalQuiz) quiz;
            return sQuiz.toDTO();
        } else {
            throw new IllegalStateException("Quiz with id " + id + " has an invalid type.");
        }
    }

    public TimeAttackQuizDTO createTimeAttackQuiz(long groupChatId, TimeAttackQuizDTO taQuiz) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId)
                .orElseThrow(() -> new DataNotFoundException("Group chat with id " + groupChatId + " not found."));
        TimeAttackQuiz quiz = new TimeAttackQuiz(
                groupChat, taQuiz.quizName(), taQuiz.description(), taQuiz.numberOfQuestions(),
                taQuiz.initialQuestionScore(), taQuiz.penaltyPerSecond(), taQuiz.wrongAnswerPenalty()
        );
        return quizRepository.save(quiz).toDTO();
    }

    public SurvivalQuizDTO createSurvivalQuiz(long groupChatId, SurvivalQuizDTO sQuiz) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId)
                .orElseThrow(() -> new DataNotFoundException("Group chat with id " + groupChatId + " not found."));
        SurvivalQuiz quiz = new SurvivalQuiz(groupChat, sQuiz.quizName(), sQuiz.description(), sQuiz.numberOfSkips());
        return quizRepository.save(quiz).toDTO();
    }

    public void deleteQuiz(long id) {
        quizRepository.deleteById(id);
    }
}
