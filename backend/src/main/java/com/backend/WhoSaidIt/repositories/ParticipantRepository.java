package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.Participant;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    List<Participant> findByGroupChatId(long groupChatId, Sort sort);
}
