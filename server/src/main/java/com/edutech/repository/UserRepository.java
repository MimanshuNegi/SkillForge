package com.edutech.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.entity.Job;
import com.edutech.entity.User;
import com.edutech.entity.User.Role;

public interface UserRepository extends JpaRepository<User,Long>{
	//write your logic here
	Optional<User> findByUsername(String username);

	Optional<User> findByEmail(String email);

	List<Job> findUsersByRole(Role role);

}

