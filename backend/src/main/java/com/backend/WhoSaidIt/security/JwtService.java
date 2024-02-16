package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.entities.User;
import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.security.tokens.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}") // Value is retrieved from the environment variable pointed to in application.yaml
    private String SECRET_KEY;

    private static final int USER_ACCESS_EXPIRATION = 1000 * 60 * 10; // 10 minutes
    private static final int USER_REFRESH_EXPIRATION = 1000 * 60 * 60 * 24 * 14; // 2 weeks
    public static final int PASSWORD_RESET_EXPIRATION = 1000 * 60 * 30; // 1/2 hour

    public String generateUserToken(UserDetails userDetails) {
        return generateUserToken(Map.of(), userDetails);
    }

    // This method generates a JWT token with the given extra claims and user details.
    // The extra claims are added to the token's payload, and the user details are added to the token's subject.
    public String generateUserToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("tokenType", TokenType.USER.name());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + USER_ACCESS_EXPIRATION))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateUserRefreshToken(UserDetails userDetails) {
        return generateUserRefreshToken(Map.of(), userDetails);
    }

    public String generateUserRefreshToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("tokenType", TokenType.REFRESH.name());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + USER_REFRESH_EXPIRATION))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generatePasswordResetToken(UserDetails userDetails) {
        return generatePasswordResetToken(Map.of(), userDetails);
    }

    public String generatePasswordResetToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("tokenType", TokenType.PASSWORD_RESET.name());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + PASSWORD_RESET_EXPIRATION))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateQuizToken(Quiz quiz) {
        return generateQuizToken(Map.of(), quiz);
    }

    // Generates a shareable quiz token with the given extra claims and quiz details.
    // For now, these shareable tokens have no expiration date.
    // TODO: Allow the user in the frontend to specify an expiration time for their shareable quiz link.
    public String generateQuizToken(
            Map<String, Object> extraClaims,
            Quiz quiz
    ) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("tokenType", TokenType.QUIZ.name());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(quiz.getId().toString())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Validates a JWT access token by checking that the token's subject matches the given user details and that
    // the token has not expired.
    public boolean validateUserAccessToken(String accessToken, UserDetails userDetails) {
        final String username = extractSubject(accessToken);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(accessToken);
    }

    // Validates a JWT refresh token by checking that the token's subject matches the given user and that the token
    // has not expired. Also checks that the user's password was not changed after the token was issued.
    // This is to ensure that if a user changes their password, all of their refresh tokens are invalidated.
    public boolean validateUserRefreshToken(String refreshToken, User user) {
        final String username = extractSubject(refreshToken);
        Date tokenIssueDate = extractAllClaims(refreshToken).getIssuedAt();
        LocalDateTime tokenIssueDateTime = tokenIssueDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        boolean isPasswordChangedAfterTokenIssued = user.getPasswordModifiedDate().isAfter(tokenIssueDateTime);

        return username.equals(user.getUsername()) && !isTokenExpired(refreshToken) && !isPasswordChangedAfterTokenIssued;
    }

    // Validates a shareable quiz token by checking that the token's subject matches the given quiz.
    public boolean validateQuizToken(String token, Quiz quiz) {
        final String quizId = extractSubject(token);
        return quizId.equals(quiz.getId().toString()); // TODO: Check quiz token expiration after that feature is added.
    }

    // Extracts the subject from a JWT token.
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extracts the token type from a JWT token. As of now there are two: "USER" and "QUIZ".
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("tokenType", String.class));
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build().parseClaimsJws(token).getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}