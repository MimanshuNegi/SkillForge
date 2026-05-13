package com.edutech.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entity.Proposal;
import com.edutech.entity.User;

@Repository
public interface ProposalRepository  extends JpaRepository<Proposal,Long>{

	boolean existsByJobIdAndFreelancerId(Long jobId, Long freelancerId);

    List<Proposal> findByFreelancerId(Long id);

	Proposal getProposalById(Long id);
	
	
	//write your logic here

	
}
