package com.edutech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entity.JobApplication;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication,Long> {
   //write your logic here

	
}
