package com.edutech.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edutech.entity.Job;
import com.edutech.entity.User;
import com.edutech.entity.User.Role;

public interface JobRepository extends JpaRepository<Job,Long>{
	
	//write your logic here
	Optional<Job> findByClientId(Long clientId);

	Optional<Job> findByClientUsername(String username);

	


}
