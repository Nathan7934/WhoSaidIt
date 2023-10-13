package com.backend.WhoSaidIt.security;

import com.backend.WhoSaidIt.entities.quiz.Quiz;
import com.backend.WhoSaidIt.security.tokens.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY = "9b46704cbe1d2143ef058c48e93dbb6db5e95329696cca78a3a43765b26127e1";
    private static final int USER_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7; // 1 week

    public String generateUserToken(UserDetails userDetails) {
        return generateUserToken(Map.of(), userDetails);
    }

    // This method generates a JWT token with the given extra claims and user details.
    // The extra claims are added to the token's payload, and the user details are added to the token's subject.
    public String generateUserToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        extraClaims.put("tokenType", TokenType.USER);
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + USER_EXPIRATION_TIME))
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
        extraClaims.put("tokenType", TokenType.QUIZ);
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(quiz.getId().toString())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Validates a JWT token by checking that the token's subject matches the given user details and that
    // the token has not expired.
    public boolean validateUserToken(String token, UserDetails userDetails) {
        final String username = extractSubject(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
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
    public TokenType extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("tokenType", TokenType.class));
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