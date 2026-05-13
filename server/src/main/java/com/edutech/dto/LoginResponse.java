package com.edutech.dto;

<<<<<<< HEAD

=======
>>>>>>> f0719eb9f42f9ee2c5fa534355d6829409e91468
import com.edutech.entity.User.Role;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {

<<<<<<< HEAD
   //Write your logic here
=======
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
>>>>>>> f0719eb9f42f9ee2c5fa534355d6829409e91468
}
