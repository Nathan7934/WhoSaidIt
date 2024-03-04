package com.backend.WhoSaidIt.controllers;

import com.backend.WhoSaidIt.DTOs.leaderboard.LeaderboardEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.SurvivalEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.TimeAttackEntryDTO;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.services.LeaderboardService;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    @GetMapping("/group-chats/{groupChatId}/leaderboard")
    public ResponseEntity<List<Pair<Long, List<LeaderboardEntryDTO>>>> getGroupChatLeaderboards(
            @PathVariable long groupChatId
    ) {
        return ResponseEntity.ok(leaderboardService.getGroupChatLeaderboards(groupChatId));
    }

    @GetMapping("/quizzes/{quizId}/leaderboard/{playerUUID}")
    public ResponseEntity<LeaderboardEntryDTO> getLeaderboardByPlayerUUID(
            @PathVariable long quizId,
            @PathVariable String playerUUID
    ) {
        Optional<LeaderboardEntryDTO> playerEntry = leaderboardService.getLeaderboardEntryByUUID(quizId, UUID.fromString(playerUUID));
        return playerEntry.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
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

    @PatchMapping("/quizzes/{quizId}/leaderboard/{entryId}/time-attack")
    public ResponseEntity<String> updateTimeAttackEntry(
            @PathVariable long quizId,
            @PathVariable long entryId,
            @RequestBody TimeAttackEntryPostRequest taEntry) {
        try {
            leaderboardService.updateTimeAttackEntry(quizId, entryId, taEntry);
            return ResponseEntity.ok("Time attack entry with id " + entryId + " updated.");
        } catch (DataNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/quizzes/{quizId}/leaderboard/{entryId}/survival")
    public ResponseEntity<String> updateSurvivalEntry(
            @PathVariable long quizId,
            @PathVariable long entryId,
            @RequestBody SurvivalEntryPostRequest sEntry) {
        try {
            leaderboardService.updateSurvivalEntry(quizId, entryId, sEntry);
            return ResponseEntity.ok("Survival entry with id " + entryId + " updated.");
        } catch (DataNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/leaderboard/{entryId}")
    public ResponseEntity<String> deleteLeaderboardEntry(@PathVariable long entryId) {
        leaderboardService.deleteLeaderboardEntry(entryId);
        return ResponseEntity.ok("Leaderboard entry with id " + entryId + " deleted.");
    }

    public record TimeAttackEntryPostRequest(
            String playerName,
            Integer score,
            Double timeTaken,
            String playerUUID
    ) {}

    public record SurvivalEntryPostRequest(
            String playerName,
            Integer streak,
            Integer skipsUsed,
            String playerUUID
    ) {}
}
