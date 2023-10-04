package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO getUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("User with id " + id + " not found.")
        );
        return user.toDTO();
    }
}
