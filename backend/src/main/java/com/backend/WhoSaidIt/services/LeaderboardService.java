package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.leaderboard.LeaderboardEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.SurvivalEntryDTO;
import com.backend.WhoSaidIt.DTOs.leaderboard.TimeAttackEntryDTO;
import com.backend.WhoSaidIt.entities.leaderboard.LeaderboardEntry;
import com.backend.WhoSaidIt.entities.leaderboard.SurvivalEntry;
import com.backend.WhoSaidIt.entities.leaderboard.TimeAttackEntry;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.entities.quiz.SurvivalQuiz;
import com.backend.WhoSaidIt.entities.quiz.TimeAttackQuiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.LeaderboardEntryRepository;
import com.backend.WhoSaidIt.repositories.QuizRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

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
        Sort sort;
        List<LeaderboardEntry> entries;
        if (quiz instanceof TimeAttackQuiz) {
            sort = Sort.by(Sort.Order.desc("score"), Sort.Order.asc("timeTaken"));
            entries = leaderboardEntryRepository.findByQuizId(quizId, sort);
        } else if (quiz instanceof SurvivalQuiz) {
            sort = Sort.by(Sort.Order.desc("streak"), Sort.Order.asc("skipsUsed"));
            entries = leaderboardEntryRepository.findByQuizId(quizId, sort);
        } else {
            throw new IllegalStateException("Quiz with id " + quizId + " has an invalid type.");
        }

        return entries.stream().map(LeaderboardEntry::toDTO).toList();
    }

    public LeaderboardEntryDTO getLeaderboardEntry(long entryId) {
        LeaderboardEntry entry = leaderboardEntryRepository.findById(entryId).orElseThrow();
        return entry.toDTO();
    }

    public TimeAttackEntryDTO createTimeAttackEntry(long quizId, TimeAttackEntryDTO taEntry) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));
        TimeAttackEntry entry = new TimeAttackEntry(
                quiz, taEntry.playerName(), taEntry.score(), taEntry.timeTaken(), taEntry.averageTimePerQuestion()
        );
        return leaderboardEntryRepository.save(entry).toDTO();
    }

    public SurvivalEntryDTO createSurvivalEntry(long quizId, SurvivalEntryDTO sEntry) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz with id " + quizId + " not found."));
        SurvivalEntry entry = new SurvivalEntry(quiz, sEntry.playerName(), sEntry.streak(), sEntry.skipsUsed());
        return leaderboardEntryRepository.save(entry).toDTO();
    }

    public void deleteLeaderboardEntry(long id) {
        leaderboardEntryRepository.deleteById(id);
    }
}
