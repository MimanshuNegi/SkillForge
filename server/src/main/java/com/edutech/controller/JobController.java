package com.edutech.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.dto.JobDTO;
import com.edutech.entity.Job;
import com.edutech.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    //  1. POST /api/jobs/client/{clientId} - Create a new job
    @PostMapping("/client/{clientId}")
    public ResponseEntity<Job> createJob(@PathVariable Long clientId,
                                         @Valid @RequestBody Job job) {

        Job createdJob = jobService.createJob(clientId, job);

        return ResponseEntity.ok(createdJob);
    }

    //  2. GET /api/jobs - Get all jobs as JobDTO list
    @GetMapping
    public ResponseEntity<List<JobDTO>> getAllJobs() {

        List<JobDTO> jobs = jobService.getAllJobs();

        return ResponseEntity.ok(jobs);
    }

    //  3. GET /api/jobs/{id} - Get job by ID
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {

        Job job = jobService.getJobById(id);

        return ResponseEntity.ok(job);
    }

    //  4. PUT /api/jobs/status/{jobId}?status= - Update job status
    @PutMapping("/status/{jobId}")
    public ResponseEntity<Job> updateJobStatus(@PathVariable Long jobId,
                                               @RequestParam String status) {

        Job updatedJob = jobService.updateJobStatus(jobId, status);

        return ResponseEntity.ok(updatedJob);
    }

    //  5. POST /api/jobs/{jobId}/apply - Apply to a job
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<Map<String, String>> applyToJob(
            @PathVariable Long jobId,
            @RequestParam Long userId) {

        Map<String, String> response = new HashMap<>();

        //  Check duplicate
        if (jobService.hasUserAlreadyApplied(jobId, userId)) {
            response.put("message", "Already Applied.");
            return ResponseEntity.ok(response);
        }

        jobService.applyToJob(jobId, userId);

        response.put("message", "Applied successfully.");
        return ResponseEntity.ok(response);
    }

    //  6. GET /api/jobs/my-jobs - Get jobs posted by logged-in client
    @GetMapping("/my-jobs")
    public ResponseEntity<List<JobDTO>> getMyJobs(@RequestParam String username) {

        List<JobDTO> jobs = jobService.getJobsPostedByClient(username);

        return ResponseEntity.ok(jobs);
    }

    //  7. DELETE /api/jobs/{id} - Delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {

        jobService.deleteJob(id);

        return ResponseEntity.ok().build();
    }

    //  8. GET /api/jobs/report/users - Get user report
    @GetMapping("/report/users")
    public ResponseEntity<Map<String, Object>> getUserReport() {

        Map<String, Object> report = jobService.getUserReport();

        return ResponseEntity.ok(report);
    }
}