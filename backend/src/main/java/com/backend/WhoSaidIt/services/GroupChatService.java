package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.GroupChatDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupChatService {

    private final GroupChatRepository repository;

    public GroupChatService(GroupChatRepository repository) {
        this.repository = repository;
    }

    public List<GroupChatDTO> getUserGroupChats(long userId) {
        return repository.findByUserId(userId).stream().map(GroupChat::toDTO).toList();
    }

    public GroupChatDTO getGroupChat(long groupChatId) {
        GroupChat groupChat = repository.findById(groupChatId).orElseThrow(
                () -> new DataNotFoundException("GroupChat with id " + groupChatId + " not found.")
        );
        return groupChat.toDTO();
    }

    // We return a GroupChat object instead of its DTO because this method is only called in the FileUploadService
    public GroupChat createGroupChat(User user, String groupChatName, String fileName) {
        GroupChat groupChat = new GroupChat(user, groupChatName, fileName);
        repository.save(groupChat);
        return groupChat;
    }

    public void deleteGroupChat(long groupChatId) {
        repository.deleteById(groupChatId);
    }
}
