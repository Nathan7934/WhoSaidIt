package com.backend.WhoSaidIt;

import com.backend.WhoSaidIt.entities.*;
import com.backend.WhoSaidIt.repositories.GroupChatRepository;
import com.backend.WhoSaidIt.repositories.MessageRepository;
import com.backend.WhoSaidIt.repositories.ParticipantRepository;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

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
			User user = new User("test", "password", "test@email.com", Role.USER);
			GroupChat groupChat = new GroupChat(user, "testChat", "test.txt");
			Participant participant = new Participant(groupChat, "Nathan");
			Message message1 = new Message(participant, groupChat, "Message 1", LocalDateTime.now());
			Message message2 = new Message(participant, groupChat, "Message 2", LocalDateTime.now());
			Message message3 = new Message(participant, groupChat, "Message 3", LocalDateTime.now());
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
