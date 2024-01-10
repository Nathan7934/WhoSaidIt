package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.quiz.QuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.SurvivalQuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.TimeAttackQuizDTO;
import com.backend.WhoSaidIt.DTOs.quiz.info.QuizInfoDTO;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.services.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable long quizId) {
        return ResponseEntity.ok(quizService.getQuiz(quizId));
    }

    @GetMapping("/quizzes/{quizId}/info")
    public ResponseEntity<QuizInfoDTO> getQuizInfo(@PathVariable long quizId) {
        return ResponseEntity.ok(quizService.getQuizInfo(quizId));
    }

    @GetMapping("/group-chats/{groupChatId}/quizzes")
    public ResponseEntity<List<QuizDTO>> getAllQuizzes(@PathVariable long groupChatId) {
        return ResponseEntity.ok(quizService.getAllQuizzes(groupChatId));
    }

    @PostMapping("/group-chats/{groupChatId}/quizzes/time-attack")
    public ResponseEntity<TimeAttackQuizDTO> createTimeAttackQuiz(
            @PathVariable long groupChatId,
            @RequestBody TimeAttackQuizPostRequest quiz) {
        return ResponseEntity.ok(quizService.createTimeAttackQuiz(groupChatId, quiz));
    }

    @PostMapping("/group-chats/{groupChatId}/quizzes/survival")
    public ResponseEntity<SurvivalQuizDTO> createSurvivalQuiz(
            @PathVariable long groupChatId,
            @RequestBody SurvivalQuizPostRequest quiz) {
        return ResponseEntity.ok(quizService.createSurvivalQuiz(groupChatId, quiz));
    }

    @PostMapping("/quizzes/{quizId}/messages")
    public ResponseEntity<String> addMessagesToQuiz(
            @PathVariable long quizId,
            @RequestBody List<Long> messageIds
    ) {
        try {
            quizService.addMessagesToQuiz(quizId, messageIds);
            return ResponseEntity.ok("Messages with ids " + messageIds + " added to quiz with id " + quizId + ".");
        } catch (DataNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/quizzes/{quizId}/messages")
    public ResponseEntity<String> removeMessagesFromQuiz(
            @PathVariable long quizId,
            @RequestBody List<Long> messageIds
    ) {
        try {
            quizService.removeMessagesFromQuiz(quizId, messageIds);
            return ResponseEntity.ok("Messages with ids " + messageIds + " removed from quiz with id " + quizId + ".");
        } catch (DataNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<String> deleteQuiz(@PathVariable long quizId) {
        try {
            quizService.deleteQuiz(quizId);
            return ResponseEntity.ok("Quiz deleted with id " + quizId + " deleted.");
        } catch (DataNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // An HTTP request DTO for creating a time attack quiz
    public record TimeAttackQuizPostRequest(
            String quizName,
            String description,
            Integer numberOfQuestions,
            Integer initialQuestionScore,
            Integer penaltyPerSecond,
            Integer wrongAnswerPenalty
    ) {}

    // An HTTP request DTO for creating a survival quiz
    public record SurvivalQuizPostRequest(
            String quizName,
            String description,
            Integer numberOfSkips
    ) {}
}
