package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.DTOs.GroupChatDTO;
import com.backend.WhoSaidIt.DTOs.GroupChatInfoDTO;
import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class GroupChatService {

    private final GroupChatRepository groupChatRepository;

    private final QuizService quizService;
    private final MessageService messageService;

    public GroupChatService(GroupChatRepository groupChatRepository, QuizService quizService, MessageService messageService) {
        this.groupChatRepository = groupChatRepository;
        this.quizService = quizService;
        this.messageService = messageService;
    }

    public List<GroupChatDTO> getUserGroupChats(long userId) {
        return groupChatRepository.findByUserId(userId).stream().map(GroupChat::toDTO).toList();
    }

    public List<GroupChatInfoDTO> getAllUserGroupChatInfo(long userId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "uploadDate");
        return groupChatRepository.findByUserId(userId, sort).stream().map(GroupChat::toInfoDTO).toList();
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

    @Transactional
    public void deleteGroupChat(long groupChatId) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId).orElseThrow(
                () -> new DataNotFoundException("GroupChat with id " + groupChatId + " not found.")
        );

        // We iteratively remove the quizzes and messages from the group chat using their respective service methods
        // since they contain additional logic to ensure referential integrity and clearing of orphaned data.
        List<Quiz> quizzes = new ArrayList<>(groupChat.getQuizzes());
        for (Quiz quiz : quizzes) {
            quizService.deleteQuiz(quiz.getId());
        }
        List<Message> messages = new ArrayList<>(groupChat.getMessages());
        for (Message message : messages) {
            messageService.deleteMessage(message.getId());
        }

        // Other child entities of the group chat are deleted automatically due to the reference cascade settings
        groupChatRepository.delete(groupChat);
    }

    // Used in the auth_managers to check the authenticated user's ownership rights
    public boolean isOwnedBy(long groupChatId, long userId) {
        GroupChat groupChat = groupChatRepository.findById(groupChatId).orElseThrow(
                () -> new DataNotFoundException("GroupChat with id " + groupChatId + " not found.")
        );
        return groupChat.getUser().getId() == userId;
    }
}
