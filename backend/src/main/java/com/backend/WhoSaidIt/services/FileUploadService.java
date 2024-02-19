package com.backend.WhoSaidIt.services;

import com.backend.WhoSaidIt.entities.GroupChat;
import com.backend.WhoSaidIt.entities.Participant;
import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.exceptions.BadFormatException;
import com.backend.WhoSaidIt.exceptions.DataNotFoundException;
import com.backend.WhoSaidIt.repositories.UserRepository;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class FileUploadService {

    private final UserRepository userRepository;
    private final GroupChatService groupChatService;
    private final ParticipantService participantService;
    private final MessageService messageService;

    public FileUploadService(
            UserRepository userRepository,
            GroupChatService groupChatService,
            ParticipantService participantService,
            MessageService messageService) {
        this.userRepository = userRepository;
        this.groupChatService = groupChatService;
        this.participantService = participantService;
        this.messageService = messageService;
    }

    // Indices of the date, sender, and content in the parsed line
    private static final int DATE_INDEX = 0;
    private static final int SENDER_INDEX = 1;
    private static final int CONTENT_INDEX = 2;

    // This method is meant to filter out messages that are not noteworthy.
    // For now, we will only filter based on the length of the message.
    // Longer messages are more likely to be attributable to a specific person.
    private static boolean passesFilter(String message, int minCharacters) {
        return message.length() >= minCharacters;
    }

    // This method is meant to clean the message of any unsightly strings.
    // These can include links, @mentions, WhatsApp-specific formatting (e.g., <This Message Was Edited>), etc.
    private static String cleanMessage(String message) {
        // Remove any URLs from the message
        String cleanedMessage = message.replaceAll("\\b(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]", "");

        // Remove any @mentions from the message
        cleanedMessage = cleanedMessage.replaceAll("@\\d+", "");

        // Remove <This message was edited> tags
        cleanedMessage = cleanedMessage.replaceAll("<This message was edited>", "");

        return cleanedMessage;
    }

    // Returns a string array of length 3
    // [0]: Date string, [1]: Sender name, [2]: Message content
    private static String[] parseLine(String line, int minCharacters) {
        // Pattern A: "MM/DD/YY, HH:MM AM/PM - Sender Name: Message Content"
        Pattern a = Pattern.compile("^\\d{1,2}/\\d{1,2}/\\d{1,2}, \\d{1,2}:\\d{1,2}[ \\u202F](AM|PM) - .*:.*$");
        // Pattern B (older export version): "[MM/DD/YY, HH:MM:SS AM/PM] Sender Name: Message Content"
        Pattern b = Pattern.compile("^\\[\\d{1,2}/\\d{1,2}/\\d{1,2}, \\d{1,2}:\\d{1,2}:\\d{1,2} (AM|PM)] .*: .*$");

        String[] parsedLine;
        if (a.matcher(line).matches()) {
            parsedLine = parsePatternA(line);
        } else if (b.matcher(line).matches()) {
            parsedLine = parsePatternB(line);
        } else {
            return null;
        }

        parsedLine[CONTENT_INDEX] = cleanMessage(parsedLine[CONTENT_INDEX]);
        return passesFilter(parsedLine[CONTENT_INDEX], minCharacters) ? parsedLine : null;
    }

    // Pattern A: "MM/DD/YY, HH:MM AM/PM - Sender Name: Message Content"
    private static String[] parsePatternA(String line) {
        String[] parsedLine = new String[3];
        int dateEndIndex = -1;
        for (int i = 0; i < line.length(); i++) {
            if (line.charAt(i) == '-' && dateEndIndex == -1) {
                parsedLine[DATE_INDEX] = line.substring(0, i - 1);
                dateEndIndex = i + 2;
            } else if (line.charAt(i) == ':' && dateEndIndex != -1) {
                parsedLine[SENDER_INDEX] = line.substring(dateEndIndex, i);
                parsedLine[CONTENT_INDEX] = line.substring(i + 2);
                break;
            }
        }
        return parsedLine;
    }

    // Pattern B (older export version): "[MM/DD/YY, HH:MM:SS AM/PM] Sender Name: Message Content"
    private static String[] parsePatternB(String line) {
        String[] parsedLine = new String[3];
        int dateEndIndex = -1;
        for (int i = 0; i < line.length(); i++) {
            if (line.charAt(i) == ']' && dateEndIndex == -1) {
                // We exclude the seconds from the older version of the date string
                parsedLine[DATE_INDEX] = line.substring(1, i - 6) + line.substring(i - 3, i);
                dateEndIndex = i + 2;
            } else if (line.charAt(i) == ':' && dateEndIndex != -1) {
                parsedLine[SENDER_INDEX] = line.substring(dateEndIndex, i);
                parsedLine[CONTENT_INDEX] = line.substring(i + 2);
                break;
            }
        }
        return parsedLine;
    }

    // Converts a date string of the form "MM/DD/YYYY, HH:MM AM/PM" to a LocalDateTime object
    private static LocalDateTime convertDateString(String dateStr) {
        String nnbsFixed = dateStr.replace('\u202F', ' ');
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yy, h:mm a", Locale.US);
        return LocalDateTime.parse(nnbsFixed, formatter);
    }

    // Adds a group chat to the database from a file
    @Transactional
    public void persistGroupChatFromFile(
            long userId, String groupChatName, MultipartFile file, Integer minCharacters
    ) throws IOException {
        GroupChat groupChat = groupChatService.createGroupChat(userId, groupChatName, file.getOriginalFilename());

        // Each key in the messages map is a sender name, and each value is a list of pairs of timestamps and message
        HashMap<String, List<Pair<LocalDateTime, String>>> messages = new HashMap<String, List<Pair<LocalDateTime, String>>>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        while (reader.ready()) {
            String[] parsedLine = parseLine(reader.readLine(), minCharacters);
            if (parsedLine == null) { continue; }

            String senderName = parsedLine[SENDER_INDEX];
            String messageContent = parsedLine[CONTENT_INDEX];
            LocalDateTime timestamp = convertDateString(parsedLine[DATE_INDEX]);
            if (messages.containsKey(senderName)) {
                messages.get(senderName).add(new Pair<>(timestamp, messageContent));
            } else {
                messages.put(senderName, new ArrayList<>(List.of(new Pair<>(timestamp, messageContent))));
            }
        }

        // If the list of messages is empty, we throw an exception
        // This is because the file is likely not a valid chat export, or the format has been updated by WhatsApp
        if (messages.isEmpty()) {
            throw new BadFormatException("Could not parse any messages from the file. Possibly incompatible format.");
        }

        for (String senderName : messages.keySet()) {
            Participant participant = participantService.saveParticipant(groupChat, senderName);
            for (Pair<LocalDateTime, String> message : messages.get(senderName)) {
                messageService.saveMessage(participant, groupChat, message.b, message.a);
            }
        }
    }
}
