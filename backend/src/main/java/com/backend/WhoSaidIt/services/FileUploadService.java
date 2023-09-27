package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.entities.User;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class FileUploadService {

    private final UserService userService;
    private final GroupChatService groupChatService;
    private final ParticipantService participantService;
    private final MessageService messageService;

    public FileUploadService(
            UserService userService,
            GroupChatService groupChatService,
            ParticipantService participantService,
            MessageService messageService) {
        this.userService = userService;
        this.groupChatService = groupChatService;
        this.participantService = participantService;
        this.messageService = messageService;
    }

    // This method is meant to filter out messages that are not noteworthy.
    // For now, we will only filter based on the length of the message.
    // Longer messages are more likely to be attributable to a specific person.
    private static boolean passesFilter(String message) {
        return message.length() > 50;
    }

    // Returns a string array of length 3
    // [0]: Date string, [1]: Sender name, [2]: Message content
    private static String[] parseLine(String line) {
        // The following regex matches the format:
        // MM/DD/YY, HH:MM AM/PM - Sender Name: Message Content
        Pattern pattern = Pattern.compile("^\\d{1,2}/\\d{1,2}/\\d{1,2}, \\d{1,2}:\\d{1,2}[ \\u202F](AM|PM) - .*:.*$");
        if (!pattern.matcher(line).matches()) {
            return null;
        }
        String[] parsedLine = new String[3];
        int dateEndIndex = -1;
        for (int i = 0; i < line.length(); i++) {
            if (line.charAt(i) == '-' && dateEndIndex == -1) {
                parsedLine[0] = line.substring(0, i - 1);
                dateEndIndex = i + 2;
            } else if (line.charAt(i) == ':' && dateEndIndex != -1) {
                parsedLine[1] = line.substring(dateEndIndex, i);
                parsedLine[2] = line.substring(i + 2);
                break;
            }
        }
        return passesFilter(parsedLine[2]) ? parsedLine : null;
    }

    // Converts a date string of the form "MM/DD/YYYY, HH:MM AM/PM" to a LocalDateTime object
    private static LocalDateTime convertDateString(String dateStr) {
        String nnbsFixed = dateStr.replace('\u202F', ' ');
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yy, h:mm a");
        return LocalDateTime.parse(nnbsFixed, formatter);
    }

    // Adds a group chat to the database from a file
    public void persistGroupChatFromFile(Integer userId, String groupChatName, MultipartFile file) throws IOException {
        User user = userService.get(Long.valueOf(userId));
        if (user == null) {
            throw new RuntimeException("User with id " + userId + " not found.");
        }
        GroupChat groupChat = groupChatService.save(user, groupChatName, file.getOriginalFilename());

        HashMap<String, List<Pair<LocalDateTime, String>>> messages = new HashMap<String, List<Pair<LocalDateTime, String>>>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        while (reader.ready()) {
            String[] parsedLine = parseLine(reader.readLine());
            if (parsedLine == null) { continue; }

            String senderName = parsedLine[1];
            String messageContent = parsedLine[2];
            LocalDateTime timestamp = convertDateString(parsedLine[0]);
            if (messages.containsKey(senderName)) {
                messages.get(senderName).add(new Pair<LocalDateTime, String>(timestamp, messageContent));
            } else {
                messages.put(senderName, new ArrayList<>(List.of(new Pair<LocalDateTime, String>(timestamp, messageContent))));
            }
        }

        for (String senderName : messages.keySet()) {
            Participant participant = participantService.save(groupChat, senderName);
            for (Pair<LocalDateTime, String> message : messages.get(senderName)) {
                messageService.save(participant, groupChat, message.b, message.a);
            }
        }
    }
}
