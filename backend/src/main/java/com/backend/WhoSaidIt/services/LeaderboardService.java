package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.leaderboard.LeaderboardEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.SurvivalEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.TimeAttackEntryDTO;
import com.backend.WhoSaidIt.controllers.LeaderboardController;
import com.backend.WhoSaidIt.entities.leaderboard.LeaderboardEntry;
import com.backend.WhoSaidIt.entities.leaderboard.SurvivalEntry;
import com.backend.WhoSaidIt.entities.leaderboard.TimeAttackEntry;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.entities.quiz.SurvivalQuiz;
import com.backend.WhoSaidIt.entities.quiz.TimeAttackQuiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import com.backend.WhoSaidIt.repositories.LeaderboardEntryRepository;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final QuizRepository quizRepository;

    public LeaderboardService(LeaderboardEntryRepository leaderboardEntryRepository, QuizRepository quizRepository) {
        this.leaderboardEntryRepository = leaderboardEntryRepository;
        this.quizRepository = quizRepository;
    }

    public List<LeaderboardEntryDTO> getLeaderboard(long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));

        // We want to sort the leaderboard entries differently depending on the type of quiz
        List<LeaderboardEntry> entries;
        if (quiz instanceof TimeAttackQuiz) {
            entries = leaderboardEntryRepository.findTimeAttackEntriesByQuizId(quizId);
        } else if (quiz instanceof SurvivalQuiz) {
            entries = leaderboardEntryRepository.findSurvivalEntriesByQuizId(quizId);
        } else {
            throw new IllegalStateException("Quiz with id " + quizId + " has an invalid type.");
        }

        return entries.stream().map(LeaderboardEntry::toDTO).toList();
    }

    public List<Pair<Long, List<LeaderboardEntryDTO>>> getGroupChatLeaderboards(long groupChatId) {
        List<Quiz> quizzes = quizRepository.findByGroupChatId(groupChatId);
        return quizzes.stream().map(quiz -> Pair.of(quiz.getId(), getLeaderboard(quiz.getId()))).toList();
    }

    public LeaderboardEntryDTO getLeaderboardEntry(long entryId) {
        LeaderboardEntry entry = leaderboardEntryRepository.findById(entryId).orElseThrow(() ->
                new DataNotFoundException("LeaderboardEntry with id " + entryId + " not found."));
        return entry.toDTO();
    }

    // This is used to determine if a player has already submitted a score for a quiz on their device/browser.
    // UUIDs are generated client-side and are stored in localstorage. We return the most recent entry for a given UUID.
    // Player UUIDs are only used for this purpose and are not tied to any user account.
    public Optional<LeaderboardEntryDTO> getLeaderboardEntryByUUID(long quizId, UUID playerUUID) {
        List<LeaderboardEntry> playerEntries = leaderboardEntryRepository.findByQuizIdAndPlayerUUID(quizId, playerUUID);
        if (playerEntries.isEmpty()) {
            return Optional.empty();
        }
        // Return the most recent entry with the corresponding UUID
        return Optional.of(playerEntries.stream().max(Comparator.comparing(LeaderboardEntry::getSubmissionDate)).get().toDTO());
    }

    public TimeAttackEntryDTO createTimeAttackEntry(long quizId, LeaderboardController.TimeAttackEntryPostRequest taEntry) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));
        if (!(quiz instanceof TimeAttackQuiz taQuiz)) {
            throw new IllegalStateException("Quiz with id " + quizId + " has an invalid type.");
        }
        double avgTimePerQuestion = taEntry.timeTaken() / (double) taQuiz.getNumberOfQuestions();
        TimeAttackEntry entry = new TimeAttackEntry(
                quiz, taEntry.playerName(), UUID.fromString(taEntry.playerUUID()), taEntry.score(), taEntry.timeTaken(), avgTimePerQuestion
        );
        return leaderboardEntryRepository.save(entry).toDTO();
    }

    public SurvivalEntryDTO createSurvivalEntry(long quizId, LeaderboardController.SurvivalEntryPostRequest sEntry) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));
        SurvivalEntry entry = new SurvivalEntry(
                quiz, sEntry.playerName(), UUID.fromString(sEntry.playerUUID()), sEntry.streak(), sEntry.skipsUsed()
        );
        return leaderboardEntryRepository.save(entry).toDTO();
    }

    @Transactional
    public void updateTimeAttackEntry(long quizId, long entryId, LeaderboardController.TimeAttackEntryPostRequest taEntry) {
        LeaderboardEntry entry = leaderboardEntryRepository.findById(entryId).orElseThrow(
                () -> new DataNotFoundException("Entry with id " + entryId + " not found.")
        );
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(
                () -> new DataNotFoundException("Quiz with id " + quizId + " not found.")
        );
        if (!(entry instanceof TimeAttackEntry taEntryToUpdate) || !(quiz instanceof TimeAttackQuiz taQuiz)) {
            throw new IllegalStateException("Either the entry or the quiz has an invalid type.");
        }

        double avgTimePerQuestion = taEntry.timeTaken() / (double) taQuiz.getNumberOfQuestions();
        taEntryToUpdate.setSubmissionDate(LocalDateTime.now());
        taEntryToUpdate.setScore(taEntry.score());
        taEntryToUpdate.setTimeTaken(taEntry.timeTaken());
        taEntryToUpdate.setAverageTimePerQuestion(avgTimePerQuestion);
    }

    @Transactional
    public void updateSurvivalEntry(long quizId, long entryId, LeaderboardController.SurvivalEntryPostRequest sEntry) {
        LeaderboardEntry entry = leaderboardEntryRepository.findById(entryId).orElseThrow(
                () -> new DataNotFoundException("Entry with id " + entryId + " not found.")
        );
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(
                () -> new DataNotFoundException("Quiz with id " + quizId + " not found.")
        );
        if (!(entry instanceof SurvivalEntry sEntryToUpdate) || !(quiz instanceof SurvivalQuiz)) {
            throw new IllegalStateException("Either the entry or the quiz has an invalid type.");
        }

        sEntryToUpdate.setSubmissionDate(LocalDateTime.now());
        sEntryToUpdate.setStreak(sEntry.streak());
        sEntryToUpdate.setSkipsUsed(sEntry.skipsUsed());
    }

    public void deleteLeaderboardEntry(long id) {
        leaderboardEntryRepository.deleteById(id);
    }

    // Used in the auth_managers to check the authenticated user's ownership rights
    public boolean isOwnedBy(long entryId, long userId) {
        LeaderboardEntry entry = leaderboardEntryRepository.findById(entryId).orElseThrow(
                () -> new DataNotFoundException("LeaderboardEntry with id " + entryId + " not found.")
        );
        return entry.getQuiz().getGroupChat().getUser().getId() == userId;
    }
}
