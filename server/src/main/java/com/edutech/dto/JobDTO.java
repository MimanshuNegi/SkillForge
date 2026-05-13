package com.edutech.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class JobDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Double budget;

    public JobDTO() {
    }

    public JobDTO(String title, String description, Double budget) {
        this.title = title;
        this.description = description;
        this.budget = budget;
    }

    // ✅ Getters & Setters
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
}