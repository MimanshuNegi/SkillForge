package com.edutech.service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final long EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
    private static final int MAX_ATTEMPTS = 5;

    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpData> store = new ConcurrentHashMap<>();

    private static class OtpData {
        String otp;
        long expiresAt;
        int attempts;

        OtpData(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.attempts = 0;
        }
    }

    public String generate(String username) {
        String otp = randomOtp();
        store.put(key(username), new OtpData(otp, System.currentTimeMillis() + EXPIRY_MS));
        return otp;
    }

    public boolean verify(String username, String otp) {
        OtpData data = store.get(key(username));
        if (data == null)
            return false;

        if (System.currentTimeMillis() > data.expiresAt) {
            store.remove(key(username));
            return false;
        }

        data.attempts++;
        if (data.attempts > MAX_ATTEMPTS) {
            store.remove(key(username));
            return false;
        }

        if (data.otp.equals(otp)) {
            store.remove(key(username)); // one-time use
            return true;
        }
        return false;
    }

    private String randomOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++)
            sb.append(random.nextInt(10));
        return sb.toString();
    }

    private String key(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }
}
