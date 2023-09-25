package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
