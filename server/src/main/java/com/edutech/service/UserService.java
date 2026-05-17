package com.edutech.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.entity.User;
import com.edutech.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        //  FIXED HERE
        String roleName = (user.getRole() != null)
                ? user.getRole().name()
                : "CLIENT";

        authorities.add(new SimpleGrantedAuthority(roleName));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities);
    }

    public User registerUser(User user) {

        User existingUser = userRepository.findByUsername(user.getUsername());

        if (existingUser != null) {
            return existingUser;
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> findAllUser() {
        return userRepository.findAll();
    }

    public List<User> getUserRolesDetails() {
        return userRepository.findAll();
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    //  Update user details
    //  Update user (accepts partial data as Map)
public User updateUser(Long userId, Map<String, Object> updates) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (updates.containsKey("username") && updates.get("username") != null) {
        user.setUsername((String) updates.get("username"));
    }

    if (updates.containsKey("email") && updates.get("email") != null) {
        user.setEmail((String) updates.get("email"));
    }

    if (updates.containsKey("contactNumber") && updates.get("contactNumber") != null) {
        user.setContactNumber(Long.valueOf(updates.get("contactNumber").toString()));
    }

    if (updates.containsKey("skills") && updates.get("skills") != null) {
        user.setSkills((String) updates.get("skills"));
    }

    if (updates.containsKey("bio") && updates.get("bio") != null) {
        user.setBio((String) updates.get("bio"));
    }

    return userRepository.save(user);
}

}