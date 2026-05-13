package com.edutech.dto;

<<<<<<< HEAD


=======
>>>>>>> f0719eb9f42f9ee2c5fa534355d6829409e91468
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {
<<<<<<< HEAD
//Write your logic here
    
=======

    private final String username;
    private final String password;

    @JsonCreator
    public LoginRequest(
        @JsonProperty("username") String username,
        @JsonProperty("password") String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
>>>>>>> f0719eb9f42f9ee2c5fa534355d6829409e91468
}
