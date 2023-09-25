package com.backend.WhoSaidIt;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Message;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import com.backend.WhoSaidIt.repositories.ParticipantRepository;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// Adds some sample data to the database
	// TODO: Remove later
	@Bean
	CommandLineRunner commandLineRunner(
			UserRepository userRepository,
			GroupChatRepository groupChatRepository,
			ParticipantRepository participantRepository,
			MessageRepository messageRepository) {
		return args -> {
			User user = new User(1L, "test", "password");
			GroupChat groupChat = new GroupChat(1L, user, "testChat");
			Participant participant = new Participant(1L, groupChat, "Nathan");
			Message message1 = new Message(1L, participant, groupChat, "Message 1");
			Message message2 = new Message(2L, participant, groupChat, "Message 2");
			Message message3 = new Message(3L, participant, groupChat, "Message 3");
			if (userRepository.count() == 0) {
				userRepository.save(user);
			}
			if (groupChatRepository.count() == 0) {
				groupChatRepository.save(groupChat);
			}
			if (participantRepository.count() == 0) {
				participantRepository.save(participant);
			}
			if (messageRepository.count() == 0) {
				messageRepository.save(message1);
				messageRepository.save(message2);
				messageRepository.save(message3);
			}
		};
	}
}
