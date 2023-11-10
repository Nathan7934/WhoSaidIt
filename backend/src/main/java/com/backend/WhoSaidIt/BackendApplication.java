package com.backend.WhoSaidIt;

import com.backend.WhoSaidIt.controllers.LeaderboardController;
import com.backend.WhoSaidIt.controllers.QuizController;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.repositories.UserRepository;
import com.backend.WhoSaidIt.security.AuthenticationService;
import com.backend.WhoSaidIt.services.FileUploadService;
import com.backend.WhoSaidIt.services.GroupChatService;
import com.backend.WhoSaidIt.services.LeaderboardService;
import com.backend.WhoSaidIt.services.QuizService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// Adds some sample data to the database
	// TODO: Remove later
	@Bean
	CommandLineRunner commandLineRunner(
			AuthenticationService authenticationService,
			FileUploadService fileUploadService,
			GroupChatService groupChatService,
			QuizService quizService,
			LeaderboardService leaderboardService,
			UserRepository userRepository
			) {
		return args -> {
			authenticationService.register("nathanraymant@gmail.com", "Nathan7934", "password");

			// Importing a local demo group chat file and uploading it to the database
			// "demoGroupChat.txt" is not included with the repository. Developers must provide their own test file.
			Path path = Paths.get("src/main/resources/demoGroupChat.txt");
			byte[] content = null;
			try {
				content = Files.readAllBytes(path);
			} catch (IOException e) {
				System.out.println("Error reading file");
			}
			String fileName = "demoGroupChat.txt";
			MultipartFile demoGroupChat = new MockMultipartFile(fileName, fileName, "text/plain", content);
			fileUploadService.persistGroupChatFromFile(1L, "Plumpa: End Game", demoGroupChat, 100);


			// Adding demo quizzes
			QuizController.TimeAttackQuizPostRequest taq1 = new QuizController.TimeAttackQuizPostRequest(
					"Masters of Plump", "Description", 20, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(1L, taq1); // QUIZ ID 1
			QuizController.SurvivalQuizPostRequest sq1 = new QuizController.SurvivalQuizPostRequest(
					"Plumpa Loremaster", "Description", 3
			);
			quizService.createSurvivalQuiz(1L, sq1); // QUIZ ID 2
			QuizController.TimeAttackQuizPostRequest taq2 = new QuizController.TimeAttackQuizPostRequest(
					"To Plump, or not to Plump", "Description", 30, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(1L, taq2); // QUIZ ID 3


			// Adding demo leaderboard entries to quiz ID 1
			LeaderboardController.TimeAttackEntryPostRequest taEntry1 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Nathan R", 11324, 53.25);
			leaderboardService.createTimeAttackEntry(1L, taEntry1);
			LeaderboardController.TimeAttackEntryPostRequest taEntry2 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Lucas B", 9020, 60.01);
			leaderboardService.createTimeAttackEntry(1L, taEntry2);
			LeaderboardController.TimeAttackEntryPostRequest taEntry3 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Noah Word", 8750, 47.33);
			leaderboardService.createTimeAttackEntry(1L, taEntry3);
			LeaderboardController.TimeAttackEntryPostRequest taEntry4 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Gravey", 8015, 71.12);
			leaderboardService.createTimeAttackEntry(1L, taEntry4);
			LeaderboardController.TimeAttackEntryPostRequest taEntry5 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Charlie", 7500, 55.00);
			leaderboardService.createTimeAttackEntry(1L, taEntry5);
			LeaderboardController.TimeAttackEntryPostRequest taEntry6 = new LeaderboardController.TimeAttackEntryPostRequest(
					"JareBear", 6235, 62.48);
			leaderboardService.createTimeAttackEntry(1L, taEntry6);
			LeaderboardController.TimeAttackEntryPostRequest taEntry7 = new LeaderboardController.TimeAttackEntryPostRequest(
					"TSweeny", 5950, 49.95);
			leaderboardService.createTimeAttackEntry(1L, taEntry7);

			// Adding demo leaderboard entries to quiz ID 2
			LeaderboardController.SurvivalEntryPostRequest sEntry1 = new LeaderboardController.SurvivalEntryPostRequest(
					"Nathan R", 23, 0);
			leaderboardService.createSurvivalEntry(2L, sEntry1);
			LeaderboardController.SurvivalEntryPostRequest sEntry2 = new LeaderboardController.SurvivalEntryPostRequest(
					"Noah Word", 21, 1);
			leaderboardService.createSurvivalEntry(2L, sEntry2);
			LeaderboardController.SurvivalEntryPostRequest sEntry3 = new LeaderboardController.SurvivalEntryPostRequest(
					"Carson Dwarma", 15, 0);
			leaderboardService.createSurvivalEntry(2L, sEntry3);
			LeaderboardController.SurvivalEntryPostRequest sEntry4 = new LeaderboardController.SurvivalEntryPostRequest(
					"Gravey", 14, 2);
			leaderboardService.createSurvivalEntry(2L, sEntry4);
			LeaderboardController.SurvivalEntryPostRequest sEntry5 = new LeaderboardController.SurvivalEntryPostRequest(
					"Charlie", 12, 0);
			leaderboardService.createSurvivalEntry(2L, sEntry5);
			LeaderboardController.SurvivalEntryPostRequest sEntry6 = new LeaderboardController.SurvivalEntryPostRequest(
					"Ceilester", 8, 3);
			leaderboardService.createSurvivalEntry(2L, sEntry6);

			// Adding demo leaderboard entries to quiz ID 3
			LeaderboardController.TimeAttackEntryPostRequest taEntry8 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Nathan R", 16452, 85.10);
			leaderboardService.createTimeAttackEntry(3L, taEntry8);
			LeaderboardController.TimeAttackEntryPostRequest taEntry9 = new LeaderboardController.TimeAttackEntryPostRequest(
					"ARob Robson", 14019, 90.01);
			leaderboardService.createTimeAttackEntry(3L, taEntry9);
			LeaderboardController.TimeAttackEntryPostRequest taEntry10 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Lucas B", 13000, 80.33);
			leaderboardService.createTimeAttackEntry(3L, taEntry10);
			LeaderboardController.TimeAttackEntryPostRequest taEntry11 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Brad Dem", 12215, 71.12);
			leaderboardService.createTimeAttackEntry(3L, taEntry11);

			// Adding some extra group chats without data to fill out the front end
			User user = userRepository.findById(1L).orElseThrow();
			groupChatService.createGroupChat(user, "Virgin Squad", "demoGroupChat.txt");
			groupChatService.createGroupChat(user, "Anti-Goon Chat (November 2023)", "demoGroupChat.txt");

			// Adding some extra quizzes without data to fill out the front end
			QuizController.TimeAttackQuizPostRequest taq3 = new QuizController.TimeAttackQuizPostRequest(
					"Was it Ming?", "Description", 20, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(2L, taq3); // QUIZ ID 4
			QuizController.SurvivalQuizPostRequest sq2 = new QuizController.SurvivalQuizPostRequest(
					"Spot THAT Virgin", "Description", 3
			);
			quizService.createSurvivalQuiz(2L, sq2); // QUIZ ID 5

			QuizController.TimeAttackQuizPostRequest taq4 = new QuizController.TimeAttackQuizPostRequest(
					"Oh how the Mighty have Gooned", "Description", 20, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(3L, taq4); // QUIZ ID 6
		};
	}
}
