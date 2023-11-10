package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.leaderboard.LeaderboardEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.SurvivalEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.TimeAttackEntryDTO;
import com.backend.WhoSaidIt.services.LeaderboardService;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
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

    @GetMapping("/groupChats/{groupChatId}/leaderboard")
    public ResponseEntity<List<Pair<Long, List<LeaderboardEntryDTO>>>> getGroupChatLeaderboards(
            @PathVariable long groupChatId
    ) {
        return ResponseEntity.ok(leaderboardService.getGroupChatLeaderboards(groupChatId));
    }

    @PostMapping("/quizzes/{quizId}/leaderboard/time-attack")
    public ResponseEntity<TimeAttackEntryDTO> createTimeAttackEntry(
            @PathVariable long quizId,
            @RequestBody TimeAttackEntryPostRequest taEntry) {
        return ResponseEntity.ok(leaderboardService.createTimeAttackEntry(quizId, taEntry));
    }

    @PostMapping("/quizzes/{quizId}/leaderboard/survival")
    public ResponseEntity<SurvivalEntryDTO> createSurvivalEntry(
            @PathVariable long quizId,
            @RequestBody SurvivalEntryPostRequest survivalEntry) {
        return ResponseEntity.ok(leaderboardService.createSurvivalEntry(quizId, survivalEntry));
    }

    @DeleteMapping("/leaderboard/{entryId}")
    public void deleteLeaderboardEntry(@PathVariable long entryId) {
        leaderboardService.deleteLeaderboardEntry(entryId);
    }

    public record TimeAttackEntryPostRequest(
            String playerName,
            Integer score,
            Double timeTaken
    ) {}

    public record SurvivalEntryPostRequest(
            String playerName,
            Integer streak,
            Integer skipsUsed
    ) {}
}
