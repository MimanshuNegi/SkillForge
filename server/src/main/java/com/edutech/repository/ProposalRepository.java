package com.edutech.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.entity.Proposal;
import com.edutech.entity.User;

public interface ProposalRepository  extends JpaRepository<Proposal,Long>{
	Optional<Proposal> findByJobId(Long jobId);

	Optional<Proposal> findByFreelancerId(Long freelancerID);

	boolean existsByJobIdAndFreelancerId(Long jobId,Long userId);

}
