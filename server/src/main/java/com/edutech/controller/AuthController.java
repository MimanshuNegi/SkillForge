package com.edutech.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import com.edutech.entity.User;
import com.edutech.util.JwtUtil;
import com.edutech.service.EmailService;
import com.edutech.service.OtpService;
import com.edutech.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    
@Autowired private OtpService otpService;
@Autowired private EmailService emailService;


    // 1. POST /api/auth/register — Register new user (201 Created)
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {

        User registered = userService.registerUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    // 2. POST /api/auth/login — Login, returns JWT token and role (200 OK)
    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody User loginRequest) {

    try {
        //   Step 1: Validate username + password
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        //   Step 2: Get user
        User user = userService.getUserByUsername(loginRequest.getUsername());

        //   Step 3: Generate OTP
        String otp = otpService.generate(loginRequest.getUsername());

        //   Step 4: Send email
        emailService.sendOtp(user.getEmail(), otp);

        return ResponseEntity.ok(Map.of(
            "message", "OTP sent",
            "username", user.getUsername()
        ));

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid username or password"));
    }
}


    // 3. GET /api/auth/user/{userId} — Get user profile by ID (200 OK)
    @GetMapping("/user/{userId}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long userId) {

        User user = userService.getUserProfile(userId);

        return ResponseEntity.ok(user);
    }

    // 4. GET /api/auth — Get all users (200 OK)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        List<User> users = userService.findAllUser();

        return ResponseEntity.ok(users);
    }

    //  DELETE /api/auth/user/{userId} — Delete a user (ADMIN only)
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    
//  PUT /api/auth/user/{userId} — Update user profile (accepts partial data)
@PutMapping("/user/{userId}")
public ResponseEntity<User> updateUser(@PathVariable Long userId,
                                        @RequestBody Map<String, Object> body) {
    User user = userService.updateUser(userId, body);
    return ResponseEntity.ok(user);
}

@PostMapping("/send-otp")
public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
    String username = body.get("username");

    if (username == null || username.isBlank()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
    }

    try {
        User user = userService.getUserByUsername(username);

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No email linked to this account"));
        }

        String otp = otpService.generate(username);
        emailService.sendOtp(user.getEmail(), otp);

        return ResponseEntity.ok(Map.of(
            "message", "OTP sent",
            "email", maskEmail(user.getEmail())
        ));
    } catch (Exception e) {
        // safer response (optional): don't reveal if user exists
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
    }
}

@PostMapping("/verify-otp")
public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {

    String username = body.get("username");
    String otp = body.get("otp");

    if (!otpService.verify(username, otp)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid OTP"));
    }

    //   Now issue JWT
    String token = jwtUtil.generateToken(username);
    User user = userService.getUserByUsername(username);

    return ResponseEntity.ok(Map.of(
        "token", token,
        "role", user.getRole(),
        "userId", user.getId(),
        "username", user.getUsername()
    ));
}


private String maskEmail(String email) {
    int at = email.indexOf('@');
    if (at <= 2) return email;
    return email.substring(0, 1) + "***" + email.substring(at - 1);
}
}