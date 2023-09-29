package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    long countByGroupChatId(long groupChatId);

    List<Message> findByGroupChatId(long groupChatId);

    Page<Message> findByGroupChatId(long groupChatId, Pageable pageable);
}
