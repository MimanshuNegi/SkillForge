package com.edutech.dto;

import javax.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {

    @NotBlank
    private final String username;

    @NotBlank
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
}