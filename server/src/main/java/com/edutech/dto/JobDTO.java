package com.edutech.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class JobDTO {

    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Double budget;

    private String status;

    private String clientName;

    public JobDTO() {
    }

    public JobDTO(Long id, String title, String description, Double budget, String status, String clientName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.status = status;
        this.clientName = clientName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
}