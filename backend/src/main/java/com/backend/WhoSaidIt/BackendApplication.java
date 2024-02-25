package com.backend.WhoSaidIt;

import com.backend.WhoSaidIt.controllers.LeaderboardController;
import com.backend.WhoSaidIt.controllers.QuizController;
import com.backend.WhoSaidIt.security.AuthenticationService;
import com.backend.WhoSaidIt.services.FileUploadService;
import com.backend.WhoSaidIt.services.GroupChatService;
import com.backend.WhoSaidIt.services.LeaderboardService;
import com.backend.WhoSaidIt.services.QuizService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;

@SpringBootApplication
public class BackendApplication {


	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// Adds some sample data to the database when the application starts (only in dev mode)
	@Profile("dev")
	@Bean
	CommandLineRunner commandLineRunner(
			AuthenticationService authenticationService,
			FileUploadService fileUploadService,
			GroupChatService groupChatService,
			QuizService quizService,
			LeaderboardService leaderboardService
			) {
		return args -> {

			authenticationService.register("devuser@gmail.com", "DevUser", "password");

			// Adding some extra group chats without data to fill out the front end
			groupChatService.createGroupChat(1L, "Green Groove Gardens", "GGgardens.txt");
			groupChatService.createGroupChat(1L, "Blue Horizon Holdings (2024)", "bluehorizon.txt");

			// Adding some extra quizzes without data to fill out the front end
			QuizController.TimeAttackQuizPostRequest taq3 = new QuizController.TimeAttackQuizPostRequest(
					"Universally Challenged", "", 20, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(1L, taq3); // QUIZ ID 1
			QuizController.SurvivalQuizPostRequest sq2 = new QuizController.SurvivalQuizPostRequest(
					"To Quiz, or not to Quiz", "", 3
			);
			quizService.createSurvivalQuiz(1L, sq2); // QUIZ ID 2

			QuizController.TimeAttackQuizPostRequest taq4 = new QuizController.TimeAttackQuizPostRequest(
					"Who baffled the Blue Group?", "", 20, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(2L, taq4); // QUIZ ID 3


			// Importing a local demo group chat file and uploading it to the database
			// "demoGroupChat.txt" is not included with the repository. Developers must provide their own test file.
			// The file should be located in src/main/resources
			String fileName = "demoGroupChat.txt";
			InputStream inputStream = BackendApplication.class.getResourceAsStream("/demoGroupChat.txt"); // Note the leading slash for classpath resources
			if (inputStream == null) {
				throw new FileNotFoundException("File not found: " + fileName);
			}
			MultipartFile demoGroupChat = new MockMultipartFile(fileName, fileName, "text/plain", inputStream.readAllBytes());
			fileUploadService.persistGroupChatFromFile(1L, "Demo Group Chat", demoGroupChat, 100);


			// Adding demo quizzes
			QuizController.TimeAttackQuizPostRequest taq1 = new QuizController.TimeAttackQuizPostRequest(
					"Outrageous Outbursts", "This is where a custom description will appear",
					20, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(3L, taq1); // QUIZ ID 4
			QuizController.SurvivalQuizPostRequest sq1 = new QuizController.SurvivalQuizPostRequest(
					"Become Loremaster", "", 3
			);
			quizService.createSurvivalQuiz(3L, sq1); // QUIZ ID 5
			QuizController.TimeAttackQuizPostRequest taq2 = new QuizController.TimeAttackQuizPostRequest(
					"Les Quizerables", "", 30, 500, 50, 200
			);
			quizService.createTimeAttackQuiz(3L, taq2); // QUIZ ID 6


			// Adding demo leaderboard entries to quiz ID 4
			LeaderboardController.TimeAttackEntryPostRequest taEntry1 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Joy Gibbs", 11324, 53.25);
			leaderboardService.createTimeAttackEntry(4L, taEntry1);
			LeaderboardController.TimeAttackEntryPostRequest taEntry2 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Bobby Baxter", 9020, 60.01);
			leaderboardService.createTimeAttackEntry(4L, taEntry2);
			LeaderboardController.TimeAttackEntryPostRequest taEntry3 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Mr. Word", 8750, 47.33);
			leaderboardService.createTimeAttackEntry(4L, taEntry3);
			LeaderboardController.TimeAttackEntryPostRequest taEntry4 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Gravey", 8015, 71.12);
			leaderboardService.createTimeAttackEntry(4L, taEntry4);
			LeaderboardController.TimeAttackEntryPostRequest taEntry5 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Chuck Jones", 7500, 55.00);
			leaderboardService.createTimeAttackEntry(4L, taEntry5);
			LeaderboardController.TimeAttackEntryPostRequest taEntry6 = new LeaderboardController.TimeAttackEntryPostRequest(
					"JareBear", 6235, 62.48);
			leaderboardService.createTimeAttackEntry(4L, taEntry6);
			LeaderboardController.TimeAttackEntryPostRequest taEntry7 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Mick Lyons", 5950, 49.95);
			leaderboardService.createTimeAttackEntry(4L, taEntry7);

			// Adding demo leaderboard entries to quiz ID 5
			LeaderboardController.SurvivalEntryPostRequest sEntry1 = new LeaderboardController.SurvivalEntryPostRequest(
					"Chuck Jones", 23, 0);
			leaderboardService.createSurvivalEntry(5L, sEntry1);
			LeaderboardController.SurvivalEntryPostRequest sEntry2 = new LeaderboardController.SurvivalEntryPostRequest(
					"Mr. Word", 21, 1);
			leaderboardService.createSurvivalEntry(5L, sEntry2);
			LeaderboardController.SurvivalEntryPostRequest sEntry3 = new LeaderboardController.SurvivalEntryPostRequest(
					"Dwarman", 15, 0);
			leaderboardService.createSurvivalEntry(5L, sEntry3);
			LeaderboardController.SurvivalEntryPostRequest sEntry4 = new LeaderboardController.SurvivalEntryPostRequest(
					"Gravey", 14, 2);
			leaderboardService.createSurvivalEntry(5L, sEntry4);
			LeaderboardController.SurvivalEntryPostRequest sEntry5 = new LeaderboardController.SurvivalEntryPostRequest(
					"Joy Gibbs", 12, 0);
			leaderboardService.createSurvivalEntry(5L, sEntry5);
			LeaderboardController.SurvivalEntryPostRequest sEntry6 = new LeaderboardController.SurvivalEntryPostRequest(
					"Ceilester", 8, 3);
			leaderboardService.createSurvivalEntry(5L, sEntry6);

			// Adding demo leaderboard entries to quiz ID 6
			LeaderboardController.TimeAttackEntryPostRequest taEntry8 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Joy Gibbs", 16452, 85.10);
			leaderboardService.createTimeAttackEntry(6L, taEntry8);
			LeaderboardController.TimeAttackEntryPostRequest taEntry9 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Rob Robson", 14019, 90.01);
			leaderboardService.createTimeAttackEntry(6L, taEntry9);
			LeaderboardController.TimeAttackEntryPostRequest taEntry10 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Troy Grant", 13000, 80.33);
			leaderboardService.createTimeAttackEntry(6L, taEntry10);
			LeaderboardController.TimeAttackEntryPostRequest taEntry11 = new LeaderboardController.TimeAttackEntryPostRequest(
					"Whitney", 12215, 71.12);
			leaderboardService.createTimeAttackEntry(6L, taEntry11);
		};
	}
}
