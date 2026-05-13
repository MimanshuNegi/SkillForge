package com.edutech.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import com.edutech.entity.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long>{
	//write your logic here
	Optional<User> getUserByUsername(String username);

	User findByUsername(String username);

}

