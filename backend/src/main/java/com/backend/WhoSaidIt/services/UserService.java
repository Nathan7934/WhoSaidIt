package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class UserService {

    public final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User get(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new DataNotFoundException("User with id " + id + " not found.")
        );
    }
}
