package com.backend.WhoSaidIt.security.authentication_managers;

import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.repositories.UserRepository;
import com.backend.WhoSaidIt.security.tokens.PasswordResetAuthenticationToken;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.function.Supplier;

@Component
public class PasswordResetAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {
    // This class is used to determine whether a user is authorized to reset their password.

    private final UserRepository userRepository;

    public PasswordResetAuthorizationManager(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        Authentication auth = authentication.get();
        HttpServletRequest request = context.getRequest();

        // We only accept valid PasswordResetAuthenticationTokens for password reset requests.
        if (!(auth instanceof PasswordResetAuthenticationToken)) {
            return new AuthorizationDecision(false);
        }

        Long requestedUserId = getUserIdFromRequestPath(request);
        if (requestedUserId == null) {
            return new AuthorizationDecision(false); // Deny if we can't determine the request userId
        }

        // Using map to handle the User if present, otherwise returning false AuthorizationDecision directly.
        return userRepository.findById(requestedUserId)
                .map(user -> {
                    // We only want the user who owns the password reset request to be able to reset their password.
                    UserDetails tokenUser = (UserDetails) auth.getPrincipal();
                    String tokenUsername = tokenUser.getUsername();
                    return new AuthorizationDecision(tokenUsername.equals(user.getUsername()));
                })
                .orElse(new AuthorizationDecision(false)); // User not found
    }

    private static Long getUserIdFromRequestPath(HttpServletRequest request) {
        // "/api/reset-password/{userId}"
        String[] pathParts = request.getRequestURI().split("/");
        if (pathParts.length < 4) {
            return null;
        }
        try {
            return Long.parseLong(pathParts[3]);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
