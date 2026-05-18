package com.edutech.service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.edutech.entity.Job;
import com.edutech.entity.Proposal;
import com.edutech.entity.User;
import com.edutech.repository.JobRepository;
import com.edutech.repository.ProposalRepository;
import com.edutech.repository.UserRepository;


@Service
public class ProposalService {

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    // 1. Create Proposal
   
public Proposal createProposal(Long freelancerId, Proposal proposal) {

    User freelancer = userRepository.findById(freelancerId)
            .orElseThrow(() -> new RuntimeException("Freelancer not found"));

    proposal.setFreelancer(freelancer);
    proposal.setStatus("PENDING");

    return proposalRepository.save(proposal);
}


    // 2. Get all proposals
    public List<Proposal> getAllProposals() {
        return proposalRepository.findAll();
    }

    // 3. Get proposal by ID (RETURN Optional — to match tests)
    public Optional<Proposal> getProposalById(Long id) {
        return proposalRepository.findById(id);
    }

    // 4. Update proposal
    public Proposal updateProposal(Long id, Proposal proposalDetails) {

        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        proposal.setBidAmount(proposalDetails.getBidAmount());
        proposal.setStatus(proposalDetails.getStatus());
        proposal.setAppliedAt(LocalDateTime.now());

        return proposalRepository.save(proposal);
    }

    // 5. Delete proposal
    public void deleteProposal(Long id) {
        
        proposalRepository.deleteById(id);
    }

    // 6. Get proposals by freelancer username
    public List<Proposal> getProposalsByFreelancerUsername(String username) {

        User freelancer = userRepository.findByUsername(username);

        if (freelancer == null) {
            throw new UsernameNotFoundException("Freelancer not found: "+username);
        }

        return proposalRepository.findByFreelancerId(freelancer.getId());
    }

    //  Freelancer bids on a job
public Proposal bidOnJob(Long jobId, Long freelancerId, Proposal req) {

    Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

    User freelancer = userRepository.findById(freelancerId)
            .orElseThrow(() -> new RuntimeException("Freelancer not found"));

    // Prevent duplicate bid
    if (proposalRepository.existsByJobIdAndFreelancerId(jobId, freelancerId)) {
        throw new RuntimeException("Already Applied.");
    }

    Proposal p = new Proposal();
    p.setJob(job);
    p.setFreelancer(freelancer);
    p.setBidAmount(req.getBidAmount() != null ? req.getBidAmount() : 0.0);
    p.setMessage(req.getMessage());
    p.setStatus("PENDING");
    p.setAppliedAt(LocalDateTime.now());

    return proposalRepository.save(p);
}

}