package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.leaderboard.LeaderboardEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.SurvivalEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.TimeAttackEntryDTO;
import com.backend.WhoSaidIt.services.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/leaderboard/{entryId}")
    public ResponseEntity<LeaderboardEntryDTO> getLeaderboardEntry(@PathVariable long entryId) {
        return ResponseEntity.ok(leaderboardService.getLeaderboardEntry(entryId));
    }

    @GetMapping("/quizzes/{quizId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(@PathVariable long quizId) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(quizId));
    }

    @PostMapping("/quizzes/{quizId}/leaderboard/time-attack")
    public ResponseEntity<TimeAttackEntryDTO> createTimeAttackEntry(
            @PathVariable long quizId,
            @RequestBody TimeAttackEntryDTO taEntry) {
        return ResponseEntity.ok(leaderboardService.createTimeAttackEntry(quizId, taEntry));
    }

    @PostMapping("/quizzes/{quizId}/leaderboard/survival")
    public ResponseEntity<SurvivalEntryDTO> createSurvivalEntry(
            @PathVariable long quizId,
            @RequestBody SurvivalEntryDTO survivalEntry) {
        return ResponseEntity.ok(leaderboardService.createSurvivalEntry(quizId, survivalEntry));
    }

    @DeleteMapping("/leaderboard/{entryId}")
    public void deleteLeaderboardEntry(@PathVariable long entryId) {
        leaderboardService.deleteLeaderboardEntry(entryId);
    }
}
