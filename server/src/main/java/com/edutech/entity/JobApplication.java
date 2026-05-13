package com.edutech.entity;

import java.time.LocalDateTime;

import javax.persistence.*;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID of the job applied to
    private Long jobId;

    // ID of the user who applied
    private Long userId;

    // Auto-set when application is created
    private LocalDateTime appliedAt;

    public JobApplication() {
    }

    public JobApplication(Long id, Long jobId, Long userId, LocalDateTime appliedAt) {
        this.id = id;
        this.jobId = jobId;
        this.userId = userId;
        this.appliedAt = appliedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
}