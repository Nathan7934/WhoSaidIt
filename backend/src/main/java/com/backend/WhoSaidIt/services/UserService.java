package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    public final UserRepository userRepository;

    public final GroupChatService groupChatService;

    public UserService(UserRepository userRepository, GroupChatService groupChatService) {
        this.userRepository = userRepository;
        this.groupChatService = groupChatService;
    }

    // NOTE: User entities are created in the security package's AuthenticationService class using the 'register()' method.

    public UserDTO getUser(long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("User with id " + id + " not found.")
        );
        return user.toDTO();
    }

    @Transactional
    public void deleteUser(long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("User with id " + id + " not found.")
        );

        // We delete this user's group chats using the groupChatService class because it contains logic that accounts for
        // maintaining referential integrity and clearing orphaned records.
        List<GroupChat> groupChats = new ArrayList<>(user.getGroupChats());
        for (GroupChat groupChat : groupChats) {
            groupChatService.deleteGroupChat(groupChat.getId());
        }

        userRepository.delete(user);
    }

    @Transactional
    public void updateFocusedGroupChat(long userId, long groupChatId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new DataNotFoundException("User with id " + userId + " not found.")
        );
        // Find the group chat among the user's list of group chats with the given id
        GroupChat groupChat = user.getGroupChats().stream().filter(gc -> gc.getId() == groupChatId).findFirst().orElseThrow(
                () -> new DataNotFoundException("Group chat with id " + groupChatId + " not found.")
        );
        user.setFocusedGroupChat(groupChat);
    }
}
