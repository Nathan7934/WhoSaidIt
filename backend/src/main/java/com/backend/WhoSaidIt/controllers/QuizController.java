package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.quiz.QuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.SurvivalQuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.TimeAttackQuizDTO;
import com.backend.WhoSaidIt.services.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable long quizId) {
        return ResponseEntity.ok(quizService.getQuiz(quizId));
    }

    @GetMapping("/groupChats/{groupChatId}/quizzes")
    public ResponseEntity<List<QuizDTO>> getAllQuizzes(@PathVariable long groupChatId) {
        return ResponseEntity.ok(quizService.getAllQuizzes(groupChatId));
    }

    @PostMapping("/groupChats/{groupChatId}/quizzes/time-attack")
    public ResponseEntity<TimeAttackQuizDTO> createTimeAttackQuiz(
            @PathVariable long groupChatId,
            @RequestBody TimeAttackQuizDTO quiz) {
        return ResponseEntity.ok(quizService.createTimeAttackQuiz(groupChatId, quiz));
    }

    @PostMapping("/groupChats/{groupChatId}/quizzes/survival")
    public ResponseEntity<SurvivalQuizDTO> createSurvivalQuiz(
            @PathVariable long groupChatId,
            @RequestBody SurvivalQuizDTO quiz) {
        return ResponseEntity.ok(quizService.createSurvivalQuiz(groupChatId, quiz));
    }

    @DeleteMapping("/quizzes/{quizId}")
    public void deleteQuiz(@PathVariable long quizId) {
        quizService.deleteQuiz(quizId);
    }
}
