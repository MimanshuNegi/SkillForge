package com.edutech.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.integration.IntegrationProperties.RSocket.Client;
import org.springframework.stereotype.Service;

import com.edutech.dto.JobDTO;
import com.edutech.entity.Job;
import com.edutech.entity.Proposal;
import com.edutech.entity.User;
import com.edutech.repository.JobApplicationRepository;
import com.edutech.repository.JobRepository;
import com.edutech.repository.ProposalRepository;
import com.edutech.repository.UserRepository;


public class JobService {
    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    Job createJob(Long clientId,Job job){
        Client client = 
    }

}
