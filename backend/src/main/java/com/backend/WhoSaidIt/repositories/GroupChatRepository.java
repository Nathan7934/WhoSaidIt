package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.GroupChat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
}
