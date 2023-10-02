package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByGroupChatId(long groupChatId);
}
