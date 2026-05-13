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

    // ✅ 1. Create Proposal
    public Proposal createProposal(Long freelancerId, Proposal proposal) {

        // ✅ Find freelancer
        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        // ✅ Find job
        Job job = jobRepository.findById(proposal.getJob().getId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // ✅ Set data
        proposal.setFreelancer(freelancer);
        proposal.setJob(job);
        proposal.setStatus("PENDING");

        return proposalRepository.save(proposal);
    }

    // ✅ 2. Get all proposals
    public List<Proposal> getAllProposals() {

        return proposalRepository.findAll();
    }

    // ✅ 3. Get proposal by ID
    public Proposal getProposalById(Long id) {

        return proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));
    }

    
public Proposal updateProposal(Long id, Proposal proposalDetails) {

    Proposal proposal = getProposalById(id);

    // ✅ Only update fields that exist
    proposal.setBidAmount(proposalDetails.getBidAmount());
    proposal.setStatus(proposalDetails.getStatus());

    // optional: update timestamp
    proposal.setAppliedAt(LocalDateTime.now());

    return proposalRepository.save(proposal);
}


    // ✅ 5. Delete proposal
    public void deleteProposal(Long id) {

        if (!proposalRepository.existsById(id)) {
            throw new RuntimeException("Proposal not found");
        }

        proposalRepository.deleteById(id);
    }

    // ✅ 6. Get proposals by freelancer username
    
public List<Proposal> getProposalsByFreelancerUsername(String username) {

    User freelancer = userRepository.findByUsername(username);

    if (freelancer == null) {
        throw new UsernameNotFoundException("User not found");
    }

    return proposalRepository.findByFreelancerId(freelancer.getId());
}

}

