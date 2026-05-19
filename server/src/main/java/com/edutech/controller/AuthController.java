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

    @Autowired
    private OtpService otpService;
    @Autowired
    private EmailService emailService;

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
            // Step 1: Validate username + password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            // Step 2: Get user
            User user = userService.getUserByUsername(loginRequest.getUsername());

            // Step 3: Generate OTP
            String otp = otpService.generate(loginRequest.getUsername());

            // Step 4: Send email
            emailService.sendOtp(user.getEmail(), otp);

            return ResponseEntity.ok(Map.of(
                    "message", "OTP sent",
                    "username", user.getUsername()));

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

    // DELETE /api/auth/user/{userId} — Delete a user (ADMIN only)
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    // PUT /api/auth/user/{userId} — Update user profile (accepts partial data)

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId,
            @RequestBody Map<String, Object> body) {
        try {
            User user = userService.updateUser(userId, body);

            //  Re-issue token if username changed
            String newToken = jwtUtil.generateToken(user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("contactNumber", user.getContactNumber());
            response.put("skills", user.getSkills());
            response.put("bio", user.getBio());
            response.put("token", newToken); //  Fresh token with new username

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            if ("USERNAME_TAKEN".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username is already taken"));
            }
            if ("EMAIL_TAKEN".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email is already registered"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
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
                    "email", maskEmail(user.getEmail())));
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

        // Now issue JWT
        String token = jwtUtil.generateToken(username);
        User user = userService.getUserByUsername(username);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole(),
                "userId", user.getId(),
                "username", user.getUsername()));
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 2)
            return email;
        return email.substring(0, 1) + "***" + email.substring(at - 1);
    }

    //  GET /api/auth/check-username?username=xyz — Check if username exists
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = userService.isUsernameTaken(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    //  GET /api/auth/check-email?email=xyz — Check if email exists
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.isEmailTaken(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    //  STEP 1: Validate registration data + Send OTP
    @PostMapping("/register/send-otp")
    public ResponseEntity<?> registerSendOtp(@RequestBody User user) {
        try {
            // Check duplicates first
            if (userService.isUsernameTaken(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username is already taken"));
            }
            if (userService.isEmailTaken(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email is already registered"));
            }

            // Generate OTP keyed by email (unique per registration)
            String otp = otpService.generate(user.getEmail());
            emailService.sendOtp(user.getEmail(), otp);

            return ResponseEntity.ok(Map.of(
                    "message", "OTP sent",
                    "email", maskEmail(user.getEmail())));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send OTP. Try again."));
        }
    }

    //  STEP 2: Verify OTP + Create User
    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> registerVerifyOtp(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            String otp = (String) body.get("otp");

            // Verify OTP (keyed by email)
            if (!otpService.verify(email, otp)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired OTP"));
            }

            // Build user from request body
            User user = new User();
            user.setUsername((String) body.get("username"));
            user.setEmail(email);
            user.setPassword((String) body.get("password"));
            user.setContactNumber(Long.valueOf(body.get("contactNumber").toString()));

            String roleStr = (String) body.get("role");
            user.setRole(User.Role.valueOf(roleStr));

            if (body.containsKey("skills") && body.get("skills") != null) {
                user.setSkills((String) body.get("skills"));
            }
            if (body.containsKey("bio") && body.get("bio") != null) {
                user.setBio((String) body.get("bio"));
            }

            // Final duplicate check (race condition safety)
            if (userService.isUsernameTaken(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username is already taken"));
            }
            if (userService.isEmailTaken(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email is already registered"));
            }

            User registered = userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful!",
                    "username", registered.getUsername()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }


    //  FORGOT PASSWORD — Step 1: Send OTP to user's email
@PostMapping("/forgot-password/send-otp")
public ResponseEntity<?> forgotPasswordSendOtp(@RequestBody Map<String, String> body) {
    String username = body.get("username");

    if (username == null || username.isBlank()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
    }

    try {
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No account found with this username"));
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No email linked to this account"));
        }

        String otp = otpService.generate("RESET_" + username);
        emailService.sendOtp(user.getEmail(), otp);

        return ResponseEntity.ok(Map.of(
            "message", "OTP sent",
            "email", maskEmail(user.getEmail())
        ));

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to send OTP. Try again."));
    }
}

//  FORGOT PASSWORD — Step 2: Verify OTP + Reset Password
@PostMapping("/forgot-password/reset")
public ResponseEntity<?> forgotPasswordReset(@RequestBody Map<String, String> body) {
    String username = body.get("username");
    String otp = body.get("otp");
    String newPassword = body.get("newPassword");

    if (username == null || otp == null || newPassword == null) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Username, OTP and new password are required"));
    }

    // Validate password strength
    if (newPassword.length() < 8) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Password must be at least 8 characters"));
    }

    // Verify OTP (keyed with RESET_ prefix to avoid collision with login OTP)
    if (!otpService.verify("RESET_" + username, otp)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid or expired OTP"));
    }

    try {
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        userService.updatePassword(user.getId(), newPassword);

        return ResponseEntity.ok(Map.of("message", "Password reset successful!"));

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Password reset failed. Try again."));
    }
}

}