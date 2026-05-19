package com.edutech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    //  Used by tests & service
    User findByUsername(String username);

    //  For unique validation
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}