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
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            // Generate token
            String token = jwtUtil.generateToken(loginRequest.getUsername());

            // Get role from DB
            User user = userService.getUserByUsername(loginRequest.getUsername());

            // Build response with token + role
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("userId", user.getId());
            response.put("username", user.getUsername());

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
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

    // ✅ DELETE /api/auth/user/{userId} — Delete a user (ADMIN only)
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    
// ✅ PUT /api/auth/user/{userId} — Update user profile (accepts partial data)
@PutMapping("/user/{userId}")
public ResponseEntity<User> updateUser(@PathVariable Long userId,
                                        @RequestBody Map<String, Object> body) {
    User user = userService.updateUser(userId, body);
    return ResponseEntity.ok(user);
}

}