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
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class GroupChatService {

    private final GroupChatRepository groupChatRepository;
    private final UserRepository userRepository;

    private final QuizService quizService;
    private final MessageService messageService;

    public GroupChatService(
            GroupChatRepository groupChatRepository,
            QuizService quizService,
            MessageService messageService,
            UserRepository userRepository
    ) {
        this.groupChatRepository = groupChatRepository;
        this.quizService = quizService;
        this.messageService = messageService;
        this.userRepository = userRepository;
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
    @Transactional
    public GroupChat createGroupChat(long userId, String groupChatName, String fileName) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new DataNotFoundException("User with id " + userId + " not found.")
        );

        GroupChat groupChat = new GroupChat(user, groupChatName, fileName);
        groupChatRepository.save(groupChat);

        // If this is the first group chat a user has uploaded, we want to set it as their focused group chat
        if (user.getGroupChats().isEmpty()) {
            user.setFocusedGroupChat(groupChat);
        }

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

        // If the user had set their focused group chat to this group chat, we set it to the next most recently
        // uploaded group chat, or null if there are no other group chats.
        User user = groupChat.getUser();
        if (user.getFocusedGroupChat() == groupChat) {
            List<GroupChat> groupChats = new ArrayList<>(user.getGroupChats()); // COPY
            groupChats.remove(groupChat);
            if (!groupChats.isEmpty()) {
                // The list is sorted in ascending order by upload date, so the last element is the most recent
                user.setFocusedGroupChat(groupChats.get(groupChats.size() - 1));
            } else {
                user.setFocusedGroupChat(null);
            }
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
