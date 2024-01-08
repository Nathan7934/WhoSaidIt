package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    long countByGroupChatId(long groupChatId);

    @Query("SELECT COUNT(m) FROM Quiz q JOIN q.messagesInQuiz m WHERE q.id = :quizId")
    long countByQuizId(long quizId);

    Page<Message> findByGroupChatId(long groupChatId, Pageable pageable);

    Page<Message> findByGroupChatIdAndParticipantId(long groupChatId, long participantId, Pageable pageable);

    @Query("SELECT m FROM Quiz q JOIN q.messagesInQuiz m WHERE q.id = :quizId")
    List<Message> findByQuizId(long quizId);

    @Query("SELECT m FROM Quiz q JOIN q.messagesInQuiz m WHERE q.id = :quizId")
    Page<Message> findByQuizId(long quizId, Pageable pageable);

    @Query("SELECT m FROM Quiz q JOIN q.messagesInQuiz m WHERE q.id = :quizId AND m.participant.id = :participantId")
    Page<Message> findByQuizIdAndParticipantId(long quizId, long participantId, Pageable pageable);

    // The below queries are used to select a random message from a quiz or group chat.
    // Excluded message ids are passed to prevent the same message from being selected twice in a session.
    // Pageable is used to limit the number of results to 1. Pass in PageRequest.of(0, 1) to achieve this.

    @Query("SELECT m FROM Quiz q JOIN q.messagesInQuiz m WHERE q.id = :quizId AND m.id NOT IN :excludedMessageIds ORDER BY RANDOM()")
    Page<Message> findRandomMessageByQuizId(long quizId, List<Long> excludedMessageIds, Pageable pageable);

    // Since we cannot pass an empty list for excludedMessageIds, we need to overload the method.
    @Query("SELECT m FROM Quiz q JOIN q.messagesInQuiz m WHERE q.id = :quizId ORDER BY RANDOM()")
    Page<Message> findRandomMessageByQuizId(long quizId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.groupChat.id = :groupChatId AND m.id NOT IN :excludedMessageIds ORDER BY RANDOM()")
    Page<Message> findRandomMessageByGroupChatId(long groupChatId, List<Long> excludedMessageIds, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.groupChat.id = :groupChatId ORDER BY RANDOM()")
    Page<Message> findRandomMessageByGroupChatId(long groupChatId, Pageable pageable);
}
