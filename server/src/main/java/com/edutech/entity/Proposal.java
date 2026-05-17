package com.edutech.entity;

import java.time.LocalDateTime;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "proposals")
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double bidAmount;

    private String status;

    private String message;  //  NEW: bid message / cover letter

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id")
    @JsonIgnoreProperties("proposals")
    private Job job;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "freelancer_id")
    @JsonIgnoreProperties("proposals")
    private User freelancer;

    private LocalDateTime appliedAt;

    public Proposal() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getBidAmount() { return bidAmount; }
    public void setBidAmount(Double bidAmount) { this.bidAmount = bidAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public User getFreelancer() { return freelancer; }
    public void setFreelancer(User freelancer) { this.freelancer = freelancer; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
