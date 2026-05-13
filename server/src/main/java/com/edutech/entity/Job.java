package com.edutech.entity;
import javax.management.relation.Role;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Job {

    private Long id;
    private String username;
    private String password;
    private String email;
    private Long contactNumber;
    private String skills;
    private String bio;
    private enum role; 
}
