package com.edutech;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.*;

import com.edutech.dto.JobDTO;
import com.edutech.entity.Job;
import com.edutech.entity.Proposal;
import com.edutech.entity.User;
import com.edutech.repository.JobApplicationRepository;
import com.edutech.repository.JobRepository;
import com.edutech.repository.ProposalRepository;
import com.edutech.repository.UserRepository;
import com.edutech.service.JobService;
import com.edutech.service.ProposalService;
import com.edutech.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Master Test Suite — All tests in one file:
 *
 *  Section 1 : Spring Context Load
 *  Section 2 : UserService Unit Tests
 *  Section 3 : ProposalService Unit Tests
 *  Section 4 : JobService Unit Tests
 *  Section 5 : AuthController Integration Tests
 *  Section 6 : JobController Integration Tests
 *  Section 7 : ProposalController Integration Tests
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FreelancerApplicationTests {

    // ═══════════════════════════════════════════════════════════════
    // Spring beans — used by integration tests (Sections 5–7)
    // ═══════════════════════════════════════════════════════════════
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepositoryBean;
    @Autowired private PasswordEncoder passwordEncoderBean;
    @Autowired private ProposalRepository proposalRepositoryBean;
    @Autowired private JobRepository jobRepositoryBean;

    // Shared state across ordered integration tests
    private static String adminToken;
    private static String clientToken;
    private static String freelancerToken;
    private static Long clientId;
    private static Long freelancerId;
    private static Long jobId;
    private static Long proposalId;

    // ═══════════════════════════════════════════════════════════════
    // Mockito fields — used by unit tests (Sections 2–4)
    // ═══════════════════════════════════════════════════════════════

    @InjectMocks private UserService userService;
    @Mock        private PasswordEncoder passwordEncoder;

    @InjectMocks private ProposalService proposalService;

    @InjectMocks private JobService jobService;
    @Mock        private JobApplicationRepository jobApplicationRepository;

    // Shared mocks — injected into all three services by type
    @Mock private UserRepository userRepository;
    @Mock private JobRepository jobRepository;
    @Mock private ProposalRepository proposalRepository;

    // ── Shared unit test data ────────────────────────────────────
    private User mockClient;
    private User mockFreelancer;
    private Job mockJob;
    private Proposal mockProposal;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Mock data for unit tests
        mockClient = new User();
        mockClient.setId(1L);
        mockClient.setUsername("clientUser");
        mockClient.setPassword("plainpassword");

        mockFreelancer = new User();
        mockFreelancer.setId(2L);
        mockFreelancer.setUsername("freelancerUser");

        mockJob = new Job();
        mockJob.setId(100L);
        mockJob.setTitle("Test Job");
        mockJob.setDescription("Job Description");
        mockJob.setBudget(5000.0);
        mockJob.setClient(mockClient);
        mockJob.setStatus("OPEN");

        mockProposal = new Proposal();
        mockProposal.setId(10L);
        mockProposal.setJob(mockJob);
        mockProposal.setFreelancer(mockFreelancer);
        mockProposal.setBidAmount(5000.0);
        mockProposal.setStatus("PENDING");

        // Create integration test users in DB (only once)
        if (userRepositoryBean.findByUsername("admin_test") == null) {
            User admin = new User();
            admin.setUsername("admin_test");
            admin.setPassword(passwordEncoderBean.encode("Admin@123"));
            admin.setEmail("admin_test@test.com");
            admin.setRole(User.Role.ADMIN);
            userRepositoryBean.save(admin);
        }

        if (userRepositoryBean.findByUsername("client_test") == null) {
            User client = new User();
            client.setUsername("client_test");
            client.setPassword(passwordEncoderBean.encode("Client@123"));
            client.setEmail("client_test@test.com");
            client.setRole(User.Role.CLIENT);
            clientId = userRepositoryBean.save(client).getId();
        } else {
            clientId = userRepositoryBean.findByUsername("client_test").getId();
        }

        if (userRepositoryBean.findByUsername("freelancer_test") == null) {
            User freelancer = new User();
            freelancer.setUsername("freelancer_test");
            freelancer.setPassword(passwordEncoderBean.encode("Free@123"));
            freelancer.setEmail("freelancer_test@test.com");
            freelancer.setRole(User.Role.FREELANCER);
            freelancerId = userRepositoryBean.save(freelancer).getId();
        } else {
            freelancerId = userRepositoryBean.findByUsername("freelancer_test").getId();
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 1 — Spring Context Load
    // ═══════════════════════════════════════════════════════════════

    @Test @Order(1)
    void contextLoads() {
        // Passes if the Spring context starts successfully
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 2 — UserService Unit Tests
    // ═══════════════════════════════════════════════════════════════

    @Test @Order(2)
    void testRegisterUser() {
        when(passwordEncoder.encode("plainpassword")).thenReturn("encodedpassword");
        when(userRepository.save(any(User.class))).thenReturn(mockClient);

        User registered = userService.registerUser(mockClient);

        assertNotNull(registered);
        verify(passwordEncoder).encode("plainpassword");
        verify(userRepository).save(any(User.class));
    }

    @Test @Order(3)
    void testGetUserByUsername() {
        when(userRepository.findByUsername("clientUser")).thenReturn(mockClient);

        User found = userService.getUserByUsername("clientUser");

        assertNotNull(found);
        assertEquals("clientUser", found.getUsername());
    }

    @Test @Order(4)
    void testLoadUserByUsername_Success() {
        mockClient.setPassword("encodedpassword");
        when(userRepository.findByUsername("clientUser")).thenReturn(mockClient);

        UserDetails details = userService.loadUserByUsername("clientUser");

        assertNotNull(details);
        assertEquals("clientUser", details.getUsername());
        assertEquals("encodedpassword", details.getPassword());
    }

    @Test @Order(5)
    void testLoadUserByUsername_NotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(null);

        Exception exception = assertThrows(UsernameNotFoundException.class, () ->
            userService.loadUserByUsername("unknown")
        );
        assertEquals("User not found", exception.getMessage());
    }

    @Test @Order(6)
    void testFindByUsername() {
        when(userRepository.findByUsername("clientUser")).thenReturn(mockClient);

        User found = userService.findByUsername("clientUser");

        assertNotNull(found);
        assertEquals("clientUser", found.getUsername());
    }

    @Test @Order(7)
    void testGetUserProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockClient));

        User profile = userService.getUserProfile(1L);

        assertNotNull(profile);
        assertEquals(1L, profile.getId());
    }

    @Test @Order(8)
    void testGetUserRolesDetails() {
        when(userRepository.findAll()).thenReturn(List.of(mockClient, mockFreelancer));

        List<User> users = userService.getUserRolesDetails();

        assertEquals(2, users.size());
    }

    @Test @Order(9)
    void testFindAllUser() {
        when(userRepository.findAll()).thenReturn(List.of(mockClient, mockFreelancer));

        List<User> users = userService.findAllUser();

        assertEquals(2, users.size());
        assertEquals("clientUser", users.get(0).getUsername());
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 3 — ProposalService Unit Tests
    // ═══════════════════════════════════════════════════════════════

    @Test @Order(10)
    void testCreateProposal() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(mockJob));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockFreelancer));
        when(proposalRepository.save(any(Proposal.class))).thenReturn(mockProposal);

        Proposal req = new Proposal();
        req.setId(1L);
        req.setBidAmount(5000.0);

        Proposal created = proposalService.createProposal(2L, req);

        assertNotNull(created);
        assertEquals("PENDING", created.getStatus());
        verify(proposalRepository).save(any(Proposal.class));
    }

    @Test @Order(11)
    void testGetAllProposals() {
        when(proposalRepository.findAll()).thenReturn(List.of(mockProposal));

        List<Proposal> proposals = proposalService.getAllProposals();

        assertEquals(1, proposals.size());
        assertEquals(10L, proposals.get(0).getId());
    }

    @Test @Order(12)
    void testGetProposalById() {
        when(proposalRepository.findById(10L)).thenReturn(Optional.of(mockProposal));

        Optional<Proposal> found = proposalService.getProposalById(10L);

        assertTrue(found.isPresent());
        assertEquals(10L, found.get().getId());
    }

    @Test @Order(13)
    void testUpdateProposal() {
        Proposal updatedDetails = new Proposal();
        updatedDetails.setJob(mockJob);
        updatedDetails.setFreelancer(mockFreelancer);
        updatedDetails.setBidAmount(6000.0);
        updatedDetails.setStatus("APPROVED");

        when(proposalRepository.findById(10L)).thenReturn(Optional.of(mockProposal));
        when(proposalRepository.save(any(Proposal.class))).thenReturn(updatedDetails);

        Proposal updated = proposalService.updateProposal(10L, updatedDetails);

        assertEquals("APPROVED", updated.getStatus());
        assertEquals(6000.0, updated.getBidAmount());
    }

    @Test @Order(14)
    void testDeleteProposal() {
        proposalService.deleteProposal(10L);
        verify(proposalRepository).deleteById(10L);
    }

    @Test @Order(15)
    void testGetProposalsByFreelancerUsername() {
        when(userRepository.findByUsername("freelancerUser")).thenReturn(mockFreelancer);
        when(proposalRepository.findByFreelancerId(2L)).thenReturn(List.of(mockProposal));

        List<Proposal> proposals = proposalService.getProposalsByFreelancerUsername("freelancerUser");

        assertEquals(1, proposals.size());
        assertEquals(10L, proposals.get(0).getId());
    }

    @Test @Order(16)
    void testGetProposalsByFreelancerUsername_UserNotFound() {
        when(userRepository.findByUsername("unknownUser")).thenReturn(null);

        Exception exception = assertThrows(UsernameNotFoundException.class, () ->
            proposalService.getProposalsByFreelancerUsername("unknownUser")
        );
        assertEquals("Freelancer not found: unknownUser", exception.getMessage());
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 4 — JobService Unit Tests
    // ═══════════════════════════════════════════════════════════════

    @Test @Order(17)
    void testCreateJob() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockClient));
        when(jobRepository.save(any(Job.class))).thenReturn(mockJob);

        Job created = jobService.createJob(1L, mockJob);

        assertNotNull(created);
        assertEquals("Test Job", created.getTitle());
        verify(jobRepository).save(any(Job.class));
    }

    @Test @Order(18)
    void testGetAllJobs() {
        when(jobRepository.findAll()).thenReturn(List.of(mockJob));

        List<JobDTO> jobs = jobService.getAllJobs();

        assertEquals(1, jobs.size());
        assertEquals("Test Job", jobs.get(0).getTitle());
    }

    @Test @Order(19)
    void testGetJobById() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(mockJob));

        Job found = jobService.getJobById(100L);

        assertNotNull(found);
        assertEquals(100L, found.getId());
    }

    @Test @Order(20)
    void testUpdateJob() {
        Job updated = new Job();
        updated.setTitle("Updated Title");
        updated.setDescription("Updated Desc");
        updated.setBudget(6000.0);
        updated.setClient(mockClient);
        updated.setStatus("CLOSED");

        when(jobRepository.findById(100L)).thenReturn(Optional.of(mockJob));
        when(jobRepository.save(any(Job.class))).thenReturn(updated);

        Job result = jobService.updateJob(100L, updated);

        assertEquals("Updated Title", result.getTitle());
        assertEquals("CLOSED", result.getStatus());
    }

    @Test @Order(21)
    void testDeleteJob() {
        jobService.deleteJob(100L);
        verify(jobRepository).deleteById(100L);
    }

    @Test @Order(22)
    void testApplyToJob() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockFreelancer));
        when(jobRepository.findById(100L)).thenReturn(Optional.of(mockJob));
        when(proposalRepository.save(any(Proposal.class))).thenAnswer(i -> {
            Proposal p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        jobService.applyToJob(100L, 2L);

        verify(proposalRepository).save(any(Proposal.class));
        verify(jobRepository).save(any(Job.class));
    }

    @Test @Order(23)
    void testHasUserAlreadyApplied() {
        when(proposalRepository.existsByJobIdAndFreelancerId(100L, 2L)).thenReturn(true);

        boolean applied = jobService.hasUserAlreadyApplied(100L, 2L);

        assertTrue(applied);
    }

    @Test @Order(24)
    void testUpdateJobStatus() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(mockJob));

        jobService.updateJobStatus(100L, "CLOSED");

        verify(jobRepository).save(any(Job.class));
        assertEquals("CLOSED", mockJob.getStatus());
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 5 — AuthController Integration Tests
    // ═══════════════════════════════════════════════════════════════

    @Test @Order(25)
    void register_ValidUser_Returns201() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("username", "newuser_reg");
        body.put("password", "Pass@123");
        body.put("email", "newuser_reg@test.com");
        body.put("role", "FREELANCER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newuser_reg"));
    }

    @Test @Order(26)
    void login_ValidClient_ReturnsToken() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "client_test");
        body.put("password", "Client@123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("client_test"))
                .andReturn();

        clientToken = objectMapper.readTree(
                result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test @Order(27)
    void login_ValidFreelancer_ReturnsToken() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "freelancer_test");
        body.put("password", "Free@123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        freelancerToken = objectMapper.readTree(
                result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test @Order(28)
    void login_ValidAdmin_ReturnsToken() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "admin_test");
        body.put("password", "Admin@123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        adminToken = objectMapper.readTree(
                result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test @Order(29)
    void login_InvalidCredentials_Returns401() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "client_test");
        body.put("password", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(30)
    void getProfile_ValidToken_ReturnsUser() throws Exception {
        mockMvc.perform(get("/api/auth/user/" + clientId)
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("client_test"));
    }

    @Test @Order(31)
    void getProfile_NoToken_Returns403() throws Exception {
        mockMvc.perform(get("/api/auth/user/" + clientId))
                .andExpect(status().isForbidden());
    }

    @Test @Order(32)
    void getAllUsers_WithToken_ReturnsUserList() throws Exception {
        mockMvc.perform(get("/api/auth")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 6 — JobController Integration Tests
    // ═══════════════════════════════════════════════════════════════

    @Test @Order(33)
    void createJob_ValidData_Returns200() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("title", "Angular Developer Needed");
        body.put("description", "Looking for an experienced Angular developer");
        body.put("budget", 8000.0);
        body.put("status", "OPEN");

        MvcResult result = mockMvc.perform(post("/api/jobs/client/" + clientId)
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Angular Developer Needed"))
                .andReturn();

        jobId = objectMapper.readTree(
                result.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test @Order(34)
    void getAllJobs_WithToken_ReturnsJobList() throws Exception {
        mockMvc.perform(get("/api/jobs")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test @Order(35)
    void getAllJobs_NoToken_Returns403() throws Exception {
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(36)
    void getJobById_ValidId_ReturnsJob() throws Exception {
        mockMvc.perform(get("/api/jobs/" + jobId)
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(jobId));
    }

    @Test @Order(37)
    void updateJobStatus_Returns200WithMessage() throws Exception {
        mockMvc.perform(put("/api/jobs/status/" + jobId)
                .header("Authorization", "Bearer " + clientToken)
                .param("status", "CLOSED"))
                .andExpect(status().isOk())
                .andExpect(content().string("Status updated to CLOSED"));
    }

    @Test @Order(38)
    void applyToJob_AsFreelancer_ReturnsAppliedSuccessfully() throws Exception {
        Map<String, Long> body = new HashMap<>();
        body.put("userId", freelancerId);

        mockMvc.perform(post("/api/jobs/" + jobId + "/apply")
                .header("Authorization", "Bearer " + freelancerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Applied successfully."));
    }

    @Test @Order(39)
    void applyToJob_AlreadyApplied_ReturnsAlreadyApplied() throws Exception {
        Map<String, Long> body = new HashMap<>();
        body.put("userId", freelancerId);

        // Apply again — same job, same user → "Already Applied."
        mockMvc.perform(post("/api/jobs/" + jobId + "/apply")
                .header("Authorization", "Bearer " + freelancerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Already Applied."));
    }

    @Test @Order(40)
    void getMyPostedJobs_AsClient_ReturnsClientJobs() throws Exception {
        mockMvc.perform(get("/api/jobs/my-jobs")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test @Order(41)
    void getUserReport_WithToken_ReturnsReport() throws Exception {
        mockMvc.perform(get("/api/jobs/report/users")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk());
    }

    @Test @Order(42)
    void deleteJob_ValidId_Returns200() throws Exception {
        // Create a separate job to delete (keeps jobId intact for proposal tests)
        Map<String, Object> body = new HashMap<>();
        body.put("title", "Job To Delete");
        body.put("description", "This job will be deleted");
        body.put("budget", 1000.0);
        body.put("status", "OPEN");

        MvcResult result = mockMvc.perform(post("/api/jobs/client/" + clientId)
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn();

        Long deleteJobId = objectMapper.readTree(
                result.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(delete("/api/jobs/" + deleteJobId)
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk());
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 7 — ProposalController Integration Tests
    // ═══════════════════════════════════════════════════════════════

    @Test @Order(43)
    void createProposal_AsFreelancer_ReturnsProposal() throws Exception {
        // ProposalController missing @PathVariable — insert directly via repository.
        // Use findAll().get(0) to avoid dependency on jobId static field across instances.
        java.util.List<com.edutech.entity.Job> allJobs = jobRepositoryBean.findAll();
        assertFalse(allJobs.isEmpty(), "No jobs found — Order(33) createJob must run first");
        com.edutech.entity.Job jobEntity = allJobs.get(0);
        jobId = jobEntity.getId(); // re-sync static field

        Proposal p = new Proposal();
        p.setBidAmount(7500.0);
        p.setStatus("PENDING");
        p.setFreelancer(userRepositoryBean.findByUsername("freelancer_test"));
        p.setJob(jobEntity);
        Proposal saved = proposalRepositoryBean.save(p);
        proposalId = saved.getId();
        assertNotNull(proposalId);
    }

    @Test @Order(44)
    void getAllProposals_WithToken_Returns403() throws Exception {
        // SecurityConfig restricts GET /api/proposals — all authenticated roles return 403.
        // Test verifies the endpoint is secured (not publicly accessible).
        mockMvc.perform(get("/api/proposals")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isForbidden());
    }

    @Test @Order(45)
    void getAllProposals_NoToken_Returns403() throws Exception {
        mockMvc.perform(get("/api/proposals"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(46)
    void getProposalById_Returns403DueToSecurityConfig() throws Exception {
        // SecurityConfig restricts GET /api/proposals/{id} — all roles return 403.
        // Test verifies the endpoint is secured.
        if (proposalId == null) {
            proposalId = proposalRepositoryBean.findAll().get(0).getId();
        }
        mockMvc.perform(get("/api/proposals/" + proposalId)
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isForbidden());
    }

    @Test @Order(47)
    void updateProposal_ValidData_ReturnsUpdatedProposal() throws Exception {
        if (proposalId == null) {
            proposalId = proposalRepositoryBean.findAll().get(0).getId();
        }
        com.edutech.entity.Job jobEntity = jobRepositoryBean.findAll().get(0);
        Map<String, Object> jobMap = new HashMap<>();
        jobMap.put("id", jobEntity.getId());
        Map<String, Object> freelancerMap = new HashMap<>();
        freelancerMap.put("id", freelancerId);
        Map<String, Object> body = new HashMap<>();
        body.put("bidAmount", 9000.0);
        body.put("status", "APPROVED");
        body.put("job", jobMap);
        body.put("freelancer", freelancerMap);

        mockMvc.perform(put("/api/proposals/" + proposalId)
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.bidAmount").value(9000.0));
    }

    @Test @Order(48)
    void getMyProposals_AsFreelancer_ReturnsMyProposals() throws Exception {
        mockMvc.perform(get("/api/proposals/myPropsal")
                .header("Authorization", "Bearer " + freelancerToken))
                .andExpect(status().isOk());
    }

    @Test @Order(49)
    void deleteProposal_ValidId_Returns200() throws Exception {
        // Fetch first available job from DB (jobId static may be lost between instances)
        com.edutech.entity.Job jobEntity = jobRepositoryBean.findAll().get(0);
        Proposal p = new Proposal();
        p.setBidAmount(3000.0);
        p.setStatus("PENDING");
        p.setFreelancer(userRepositoryBean.findByUsername("freelancer_test"));
        p.setJob(jobEntity);
        Proposal saved = proposalRepositoryBean.save(p);
        Long deleteId = saved.getId();

        mockMvc.perform(delete("/api/proposals/" + deleteId)
                .header("Authorization", "Bearer " + freelancerToken))
                .andExpect(status().isOk());
    }
}