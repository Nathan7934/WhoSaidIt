package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.GroupChat;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {

    public List<GroupChat> findByUserId(Long userId);

    public List<GroupChat> findByUserId(Long userId, Sort sort);
}
