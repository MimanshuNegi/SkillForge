package com.edutech.dto;

import com.edutech.entity.User.Role;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {
   String userId;

   String token;

   String username;

   String email;

   Role role;
}

