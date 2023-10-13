package com.backend.WhoSaidIt.security.authentication_managers;

import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.exceptions.InvalidTokenTypeException;
import com.backend.WhoSaidIt.security.tokens.QuizAuthenticationToken;
import com.backend.WhoSaidIt.services.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class UserAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private static final String COMMON_PATTERN_SUFFIX = "/(\\d+)(?:/[^/]+)*$";

    // Injected services are necessary to determine entity ownership.
    private final GroupChatService groupChatService;
    private final MessageService messageService;
    private final ParticipantService participantService;
    private final LeaderboardService leaderboardService;

    // Stores the regexes for matching the request URI endpoints to their respective entity types.
    private final Map<Pattern, BiFunction<Matcher, Long, Boolean>> entityPatterns;

    public UserAuthorizationManager(
            GroupChatService groupChatService,
            MessageService messageService,
            ParticipantService participantService,
            LeaderboardService leaderboardService
    ) {
        this.groupChatService = groupChatService;
        this.messageService = messageService;
        this.participantService = participantService;
        this.leaderboardService = leaderboardService;

        // The regexes are stored in a LinkedHashMap so that they can be easily traversed in order.
        // Each pattern is mapped to a handler method that determines whether the authenticated user owns the entity.
        entityPatterns = new LinkedHashMap<>();
        entityPatterns.put(Pattern.compile("^/api/users" + COMMON_PATTERN_SUFFIX), this::handleUsers);
        entityPatterns.put(Pattern.compile("^/api/groupChats" + COMMON_PATTERN_SUFFIX), this::handleGroupChats);
        entityPatterns.put(Pattern.compile("^/api/messages" + COMMON_PATTERN_SUFFIX), this::handleMessages);
        entityPatterns.put(Pattern.compile("^/api/participants" + COMMON_PATTERN_SUFFIX), this::handleParticipants);
        entityPatterns.put(Pattern.compile("^/api/leaderboard" + COMMON_PATTERN_SUFFIX), this::handleLeaderboards);
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        Authentication auth = authentication.get();
        HttpServletRequest request = context.getRequest();

        // The endpoints managed by this class are only accessible to authenticated users.
        UsernamePasswordAuthenticationToken token;
        if (auth instanceof QuizAuthenticationToken) {
            return new AuthorizationDecision(false);
        } else if (auth instanceof UsernamePasswordAuthenticationToken) {
            token = (UsernamePasswordAuthenticationToken) auth;
        } else {
            throw new InvalidTokenTypeException("Invalid token type: " + auth.getClass().getName());
        }

        // Determine which type of entity the request is for, then call the appropriate handler method to determine if
        // the authenticated user is authorized to access it (i.e., if they own the entity).
        User user = (User) token.getPrincipal();
        long userId = user.getId();
        for (Map.Entry<Pattern, BiFunction<Matcher, Long, Boolean>> entry : entityPatterns.entrySet()) {
            Matcher matcher = entry.getKey().matcher(request.getRequestURI());
            if (matcher.matches()) {
                if (entry.getValue().apply(matcher, userId)) {
                    // If the entity's handler method returns true, then the user is authorized to access it.
                    return new AuthorizationDecision(true);
                }
                return new AuthorizationDecision(false);
            }
        }

        // If the request URI does not match any of the regexes, then the user is not authorized to access it.
        return new AuthorizationDecision(false);
    }

    // Entity ownership status is determined by the following handler methods, communicating with the injected services.
    // NOTE: Quiz entities are managed by the QuizAuthorizationManager class.
    // =================================================================================================================
    private boolean handleUsers(Matcher matcher, Long userId) {
        long requestedUserId = Long.parseLong(matcher.group(1));
        return requestedUserId == userId;
    }

    private boolean handleGroupChats(Matcher matcher, Long userId) {
        long requestedGroupChatId = Long.parseLong(matcher.group(1));
        return groupChatService.isOwnedBy(requestedGroupChatId, userId);
    }

    private boolean handleMessages(Matcher matcher, Long userId) {
        long requestedMessageId = Long.parseLong(matcher.group(1));
        return messageService.isOwnedBy(requestedMessageId, userId);
    }

    private boolean handleParticipants(Matcher matcher, Long userId) {
        long requestedParticipantId = Long.parseLong(matcher.group(1));
        return participantService.isOwnedBy(requestedParticipantId, userId);
    }

    private boolean handleLeaderboards(Matcher matcher, Long userId) {
        long requestedLeaderboardId = Long.parseLong(matcher.group(1));
        return leaderboardService.isOwnedBy(requestedLeaderboardId, userId);
    }
}