package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.leaderboard.LeaderboardEntry;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {

    @Query("SELECT e FROM TimeAttackEntry e WHERE e.quiz.id = :quizId ORDER BY e.score DESC, e.timeTaken ASC")
    List<LeaderboardEntry> findTimeAttackEntriesByQuizId(long quizId);

    @Query("SELECT e FROM SurvivalEntry e WHERE e.quiz.id = :quizId ORDER BY e.streak DESC, e.skipsUsed ASC")
    List<LeaderboardEntry> findSurvivalEntriesByQuizId(long quizId);

    List<LeaderboardEntry> findByQuizIdAndPlayerUUID(long quizId, UUID playerUUID);
}
