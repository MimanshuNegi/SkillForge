package com.edutech.util;

import com.edutech.entity.User;
import com.edutech.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final UserRepository userRepository;

    @Autowired
    public JwtUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // NOTE: Keep secret in application.properties/env in real projects
    private final String secret =
            "secretKey000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    // 86400 seconds = 24 hours
    private final int expiration = 86400;

    
     // generateToken(username) - generate JWT with username as subject,
     // role claim, and expiry of 86400 seconds
    
    public String generateToken(String username) {

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration * 1000L);

        User user = userRepository.findByUsername(username);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole()); 

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)          
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    
     // extractUsername(token) - extract subject (username) from token
    
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    
     // extractAllClaims(token) - extract all claims from token
     
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }


     // isTokenExpired(token) - check if token expiry date is before current date
   
    public boolean isTokenExpired(String token) {
        Date expirationDate = extractAllClaims(token).getExpiration();
        return expirationDate.before(new Date());
    }

    
     // validateToken(token, userDetails) - validate token against user details
     
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}