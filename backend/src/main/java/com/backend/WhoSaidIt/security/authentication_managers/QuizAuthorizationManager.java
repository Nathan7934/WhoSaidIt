package com.backend.WhoSaidIt.security.authentication_managers;

import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.security.tokens.QuizAuthenticationToken;
import com.backend.WhoSaidIt.services.QuizService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class QuizAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {
    // This class is used to determine whether a user or shareable quiz token holder is authorized to access a quiz.

    // TODO: Restrict the POST /api/quizzes/{id}/messages endpoint to only authenticated users who own the quiz, and
    // TODO: only allow them to assign messages they own to their quiz.

    private final QuizService quizService;

    public QuizAuthorizationManager(QuizService quizService) {
        this.quizService = quizService;
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        Authentication auth = authentication.get();
        HttpServletRequest request = context.getRequest();

        Long requestedQuizId = getQuizIdFromRequestPath(request);
        if (requestedQuizId == null) {
            return new AuthorizationDecision(false); // Deny if we can't determine the request quizId
        }

        if (auth instanceof UsernamePasswordAuthenticationToken) { // If there is a user authenticated
            UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) auth;
            User user = (User) token.getPrincipal();

            // We only want users who own the quiz to be able to access it.
            if (quizService.isOwnedBy(requestedQuizId, user.getId())) {
                return new AuthorizationDecision(true);
            }
        }
        else if (auth instanceof QuizAuthenticationToken) { // If there is a shareable quiz token authenticated

            // Only authenticated users who own the quiz can generate a shareable quiz token or assign messages.
            if (isGenerateTokenRequest(request) || isMessageAssignmentRequest(request)) {
                return new AuthorizationDecision(false);
            }

            QuizAuthenticationToken token = (QuizAuthenticationToken) auth;
            Long tokenQuizId = Long.parseLong(token.getPrincipal());

            // We want to ensure the shareable quiz token is only used to access the quiz it was generated for.
            if (tokenQuizId.equals(requestedQuizId)) {
                return new AuthorizationDecision(true);
            }
        }
        return new AuthorizationDecision(false);
    }

    // Extracts the quiz ID from the request path.
    // For example, if the request path is "/api/quizzes/1", then this method will return 1.
    private static Long getQuizIdFromRequestPath(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        Pattern pattern = Pattern.compile("^/api/quizzes/(\\d+)(?:/[^/]+)*$");
        Matcher matcher = pattern.matcher(requestURI);
        if (matcher.find()) {
            return Long.parseLong(matcher.group(1));
        }
        return null;
    }

    // Determines if the request is for a shareable quiz token generation endpoint.
    private static boolean isGenerateTokenRequest(HttpServletRequest request) {
        return request.getRequestURI().matches("^/api/quizzes/\\d+/auth/generate-token$");
    }

    private static boolean isMessageAssignmentRequest(HttpServletRequest request) {
        boolean isProperEndpoint = request.getRequestURI().matches("^/api/quizzes/\\d+/messages$");
        return isProperEndpoint && request.getMethod().equalsIgnoreCase("POST");
    }

    // Precondition: Request must be of type POST /api/quizzes/{id}/messages
    private boolean userOwnsAllMessages(HttpServletRequest request) {
        // TODO: Figure out how to get the message ids from the request body
        return false;
    }
}