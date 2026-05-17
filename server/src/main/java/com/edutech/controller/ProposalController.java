package com.edutech.controller;

import java.util.*;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.edutech.entity.Proposal;
import com.edutech.service.ProposalService;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    @Autowired
    private ProposalService proposalService;

    @PostMapping("/freelancer/{freelancerId}")
    public ResponseEntity<Proposal> createProposal(
            @PathVariable Long freelancerId,
            @Valid @RequestBody Proposal proposal) {

        Proposal created = proposalService.createProposal(freelancerId, proposal);

        return ResponseEntity.ok(created);
    }

    // 2. GET /api/proposals - Get all proposals (403 for non-permitted roles)
    @GetMapping
    public ResponseEntity<List<Proposal>> getAllProposals() {

        List<Proposal> proposals = proposalService.getAllProposals();

        return ResponseEntity.ok(proposals);
    }

    // 3. GET /api/proposals/{id} - Get proposal by ID (403 for non-permitted roles)
    @GetMapping("/{id}")
    public ResponseEntity<Proposal> getProposalById(@PathVariable Long id) {

        Proposal proposal = proposalService.getProposalById(id).get();

        return ResponseEntity.ok(proposal);
    }

   //  Update a proposal (accepts partial body like { "status": "APPROVED" })
@PutMapping("/{id}")
public ResponseEntity<Proposal> updateProposal(
        @PathVariable Long id,
        @RequestBody Map<String, Object> body) {

    Proposal proposal = proposalService.getProposalById(id)
            .orElseThrow(() -> new RuntimeException("Proposal not found"));

    // Update fields if present in body
    if (body.containsKey("status")) {
        proposal.setStatus((String) body.get("status"));
    }
    if (body.containsKey("bidAmount")) {
        proposal.setBidAmount(Double.valueOf(body.get("bidAmount").toString()));
    }

    Proposal updated = proposalService.updateProposal(id, proposal);

    return ResponseEntity.ok(updated);
}

    // 5. DELETE /api/proposals/{id} - Delete a proposal
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(@PathVariable Long id) {

        proposalService.deleteProposal(id);

        return ResponseEntity.ok().build();
    }

    // 6. GET /api/proposals/myPropsal - Get proposals of logged-in freelancer

    @GetMapping("/myPropsal")
    public ResponseEntity<List<Proposal>> getMyProposals() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName(); // ✅ gets username from JWT

        List<Proposal> proposals = proposalService
                .getProposalsByFreelancerUsername(username);
        return ResponseEntity.ok(proposals);

    }
}