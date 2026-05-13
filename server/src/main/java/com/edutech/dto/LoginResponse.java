package com.edutech.dto;
import com.edutech.entity.User.Role;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {
    private final String token;
    private final Role role;

    @JsonCreator
    public LoginResponse(
            @JsonProperty("token") String token,
            @JsonProperty("role") Role role) {
        this.token = token;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Role getRole() {
        return role;
    }
}