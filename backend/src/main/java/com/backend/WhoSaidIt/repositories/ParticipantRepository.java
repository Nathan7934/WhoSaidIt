package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
}
