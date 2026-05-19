package com.edutech.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.edutech.util.JwtRequestFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserDetailsService userDetailsService;
    private final JwtRequestFilter jwtRequestFilter;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public SecurityConfig(UserDetailsService userDetailsService,
            JwtRequestFilter jwtRequestFilter,
            PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.jwtRequestFilter = jwtRequestFilter;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .cors().and().csrf().disable()
                .authorizeRequests()

                // 6.4 AUTH
                .antMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .antMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .antMatchers(HttpMethod.POST, "/api/auth/send-otp").permitAll()//for otp
                .antMatchers(HttpMethod.POST, "/api/auth/verify-otp").permitAll()//for otp
                
.antMatchers(HttpMethod.GET, "/api/auth/check-username").permitAll()
                .antMatchers(HttpMethod.GET, "/api/auth/check-email").permitAll()

                .antMatchers(HttpMethod.GET, "/api/auth/**").hasAnyAuthority("FREELANCER", "ADMIN", "CLIENT")
                .antMatchers(HttpMethod.DELETE, "/api/auth/**").hasAnyAuthority("ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/auth/**").authenticated()

                

                // 6.4 JOBS
                .antMatchers(HttpMethod.GET, "/api/jobs/**").hasAnyAuthority("CLIENT", "FREELANCER", "ADMIN")
                .antMatchers(HttpMethod.POST, "/api/jobs/**/apply").hasAnyAuthority("FREELANCER")
                .antMatchers(HttpMethod.POST, "/api/jobs/**").hasAnyAuthority("CLIENT", "FREELANCER")
                .antMatchers(HttpMethod.PUT, "/api/jobs/**").hasAnyAuthority("CLIENT")
                .antMatchers(HttpMethod.DELETE, "/api/jobs/**").hasAnyAuthority("ADMIN", "CLIENT")

                // 6.4 PROPOSALS
                .antMatchers(HttpMethod.GET, "/api/proposals/**").hasAnyAuthority("FREELANCER")
                .antMatchers(HttpMethod.POST, "/api/proposals/**").hasAnyAuthority("CLIENT", "FREELANCER")
                .antMatchers(HttpMethod.PUT, "/api/proposals/**").hasAnyAuthority("CLIENT")

                // All other requests - authenticated
                .anyRequest().authenticated()
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
