package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.leaderboard.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {

    List<LeaderboardEntry> findByQuizId(long quizId);
}
