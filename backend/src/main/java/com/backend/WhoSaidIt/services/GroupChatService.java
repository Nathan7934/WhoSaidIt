package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import org.springframework.stereotype.Service;

@Service
public class GroupChatService {

    private final GroupChatRepository repository;

    public GroupChatService(GroupChatRepository repository) {
        this.repository = repository;
    }

    public GroupChat get(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void remove(Long id) {
        repository.deleteById(id);
    }

    public GroupChat save(User user, String groupChatName, String fileName) {
        GroupChat groupChat = new GroupChat(user, groupChatName, fileName);
        repository.save(groupChat);
        return groupChat;
    }
}
