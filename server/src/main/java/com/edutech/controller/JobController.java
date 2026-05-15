package com.edutech.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.edutech.dto.JobDTO;
import com.edutech.entity.Job;
import com.edutech.entity.JobApplication;
import com.edutech.entity.Proposal;
import com.edutech.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    // ✅ Create Job
    @PostMapping("/client/{clientId}")
    public ResponseEntity<Job> createJob(@PathVariable Long clientId,
            @Valid @RequestBody Job job) {
        return ResponseEntity.ok(jobService.createJob(clientId, job));
    }

    // ✅ Get All Jobs
    @GetMapping
    public ResponseEntity<List<JobDTO>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // ✅ Get Job by ID
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // ✅ ✅ FIXED: Update Job Status (returns String as expected by tests)
    @PutMapping("/status/{jobId}")
    public ResponseEntity<String> updateJobStatus(@PathVariable Long jobId,
            @RequestParam String status) {

        jobService.updateJobStatus(jobId, status);
        return ResponseEntity.ok("Status updated to " + status);
    }

    // ✅ Apply to Job (FIXED)
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<Map<String, String>> applyToJob(
            @PathVariable Long jobId,
            @RequestBody Map<String, Object> body) {

        Map<String, String> response = new HashMap<>();

        // ✅ Extract userId from request body { "userId": 1 }
        Long userId = null;
        if (body != null && body.get("userId") != null) {
            userId = Long.valueOf(body.get("userId").toString());
        }

        // If userId not in body, try from JWT
        if (userId == null) {
            String username = SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

            if (username != null) {
                // You need userService here — add @Autowired if not already
                // User user = userService.findByUsername(username);
                // userId = user.getId();
            }
        }

        if (userId == null) {
            response.put("message", "User not identified");
            return ResponseEntity.badRequest().body(response);
        }

        // Check duplicate
        if (jobService.hasUserAlreadyApplied(jobId, userId)) {
            response.put("message", "Already Applied.");
            return ResponseEntity.ok(response);
        }

        jobService.applyToJob(jobId, userId);
        response.put("message", "Applied successfully.");
        return ResponseEntity.ok(response);
    }

    // ✅ Get My Jobs (client)
    @GetMapping("/my-jobs")
    public ResponseEntity<List<JobDTO>> getMyJobs() {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        return ResponseEntity.ok(jobService.getJobsPostedByClient(username));
    }

    // ✅ Delete Job
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok().build();
    }

    // ✅ User Report
    @GetMapping("/report/users")
    public ResponseEntity<Map<String, Object>> getUserReport() {
        return ResponseEntity.ok(jobService.getUserReport());
    }

    @GetMapping("/{jobId}/proposals")
    public ResponseEntity<List<Proposal>> getProposalsForJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getProposalsForJob(jobId));
    }

}