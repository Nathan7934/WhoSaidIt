package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.GroupChatDTO;
import com.backend.WhoSaidIt.DTOs.GroupChatInfoDTO;
import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupChatService {

    private final GroupChatRepository groupChatRepository;

    public GroupChatService(GroupChatRepository groupChatRepository) {
        this.groupChatRepository = groupChatRepository;
    }

    public List<GroupChatDTO> getUserGroupChats(long userId) {
        return groupChatRepository.findByUserId(userId).stream().map(GroupChat::toDTO).toList();
    }

    public List<GroupChatInfoDTO> getAllUserGroupChatInfo(long userId) {
        return groupChatRepository.findByUserId(userId).stream().map(GroupChat::toInfoDTO).toList();
    }

    public GroupChatDTO getGroupChat(long groupChatId) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId).orElseThrow(
                () -> new DataNotFoundException("GroupChat with id " + groupChatId + " not found.")
        );
        return groupChat.toDTO();
    }

    public UserDTO getGroupChatUser(long groupChatId) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId).orElseThrow(
                () -> new DataNotFoundException("GroupChat with id " + groupChatId + " not found.")
        );
        return groupChat.getUser().toDTO();
    }

    // We return a GroupChat object instead of its DTO because this method is only called in the FileUploadService
    public GroupChat createGroupChat(User user, String groupChatName, String fileName) {
        GroupChat groupChat = new GroupChat(user, groupChatName, fileName);
        groupChatRepository.save(groupChat);
        return groupChat;
    }

    public void deleteGroupChat(long groupChatId) {
        groupChatRepository.deleteById(groupChatId);
    }

    // Used in the auth_managers to check the authenticated user's ownership rights
    public boolean isOwnedBy(long groupChatId, long userId) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId).orElseThrow(
                () -> new DataNotFoundException("GroupChat with id " + groupChatId + " not found.")
        );
        return groupChat.getUser().getId() == userId;
    }
}
