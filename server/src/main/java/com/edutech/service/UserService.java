package com.edutech.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.entity.User;
import com.edutech.entity.User.Role;
import com.edutech.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
   @Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

    // IMPORTANT: use findByUsername (tests expect this usage)
    User user = userRepository.findByUsername(username);

    if (user == null) {
        // IMPORTANT: exact message expected by tests
        throw new UsernameNotFoundException("User not found");
    }

    List<SimpleGrantedAuthority> authorities = new ArrayList<>();

    // IMPORTANT: NO "ROLE_" prefix if your SecurityConfig uses hasAnyAuthority("CLIENT"...)
    authorities.add(new SimpleGrantedAuthority(user.getRole().name()));

    return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            authorities
    );
}

    //Register user (encode password)
    public User registerUser(User user) {

        // Encode password before saving 
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    //  2. Get user by username
    
public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }


    //  3. Get user profile by ID
    public User getUserProfile(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    //  4. Get all users
    public List<User> findAllUser() {

        return userRepository.findAll();
        // findAll() comes from JpaRepository ✅ [1](https://www.geeksforgeeks.org/java/spring-boot-crudrepository-with-example/)
    }

    //  5. Get all users with roles (same entity already contains role)
    public List<User> getUserRolesDetails() {

        return userRepository.findAll();
    }

    //  6. Find by username (direct repo call)
    
//  CHANGED: No more .orElseThrow()
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }


    
}




