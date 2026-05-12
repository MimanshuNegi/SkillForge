package com.edutech.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.entity.JobApplication;

public interface JobApplicationRepository  extends JpaRepository<JobApplication,Long>{
   //write your logic here
   boolean existsByJobIdAndUserId(Long jobId,Long userId);
   

	
}
