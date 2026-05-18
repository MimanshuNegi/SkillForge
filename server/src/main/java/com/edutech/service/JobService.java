package com.edutech.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.dto.JobDTO;
import com.edutech.entity.Job;
import com.edutech.entity.Proposal;
import com.edutech.entity.User;
import com.edutech.repository.JobApplicationRepository;
import com.edutech.repository.JobRepository;
import com.edutech.repository.ProposalRepository;
import com.edutech.repository.UserRepository;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    // 1. Create Job
    public Job createJob(Long clientId, Job job) {

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        job.setClient(client);
        job.setStatus("OPEN");

        return jobRepository.save(job);
    }

    // 2. Get all jobs as DTO
    public List<JobDTO> getAllJobs() {

        List<Job> jobs = jobRepository.findAll();

        return jobs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 3. Get job by ID
    public Job getJobById(Long id) {

        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    // 4. Update Job
    public Job updateJob(Long id, Job updatedJob) {

        Job job = getJobById(id);

        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setBudget(updatedJob.getBudget());

        return jobRepository.save(job);
    }

    // 5. Delete Job
    public void deleteJob(Long id) {

        jobRepository.deleteById(id);
    }

    // 6. Apply to job
    public Proposal applyToJob(Long jobId, Long userId) {

        Job job = getJobById(jobId);

        User freelancer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent duplicate apply
        if (hasUserAlreadyApplied(jobId, userId)) {
            throw new RuntimeException("User already applied for this job");
        }

        Proposal proposal = new Proposal();
        proposal.setJob(job);
        proposal.setFreelancer(freelancer);
        proposal.setStatus("APPLIED");

        proposal.setBidAmount(0.0);
        proposal.setAppliedAt(LocalDateTime.now());

        // Update job status
        job.setStatus("IN_PROGRESS");

        proposalRepository.save(proposal);
        jobRepository.save(job);

        return proposal;
    }

    // 7. Check already applied
    public boolean hasUserAlreadyApplied(Long jobId, Long freelancerId) {

        return proposalRepository.existsByJobIdAndFreelancerId(jobId, freelancerId);
    }

    // 8. Get jobs posted by client
    public List<JobDTO> getJobsPostedByClient(String username) {

        List<Job> jobs = jobRepository.findByClientUsername(username);

        return jobs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 9. Update job status
    public Job updateJobStatus(Long jobId, String status) {

        Job job = getJobById(jobId);

        job.setStatus(status);

        return jobRepository.save(job);
    }

    // 10. User Report
    public Map<String, Object> getUserReport() {

        Map<String, Object> report = new HashMap<>();

        List<User> users = userRepository.findAll();

        List<User> clients = users.stream()
                .filter(u -> u.getRole() == User.Role.CLIENT)
                .collect(Collectors.toList());

        List<User> freelancers = users.stream()
                .filter(u -> u.getRole() == User.Role.FREELANCER)
                .collect(Collectors.toList());

        report.put("totalClients", clients.size());
        report.put("totalFreelancers", freelancers.size());
        report.put("clients", clients);
        report.put("freelancers", freelancers);

        return report;
    }

    // Helper method: convert to DTO
    private JobDTO convertToDTO(Job job) {
        JobDTO dto = new JobDTO();
        dto.setId(job.getId()); //  CRITICAL
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setBudget(job.getBudget());
        dto.setStatus(job.getStatus()); //  CRITICAL

        if (job.getClient() != null) {
            dto.setClientName(job.getClient().getUsername()); //  nice to have
        }

        return dto;
    }

    public List<Proposal> getProposalsForJob(Long jobId) {
        return proposalRepository.findByJobId(jobId);
    }
    

}
