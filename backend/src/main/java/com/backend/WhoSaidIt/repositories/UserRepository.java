package com.backend.WhoSaidIt.repositories;

import com.backend.WhoSaidIt.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
