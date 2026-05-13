package com.edutech.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collection;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @Autowired
    public JwtRequestFilter(UserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
        }

        // If token not present, continue normally
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // If already authenticated, continue
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Validate + extract claims
            Claims claims = jwtUtil.extractAllClaims(jwt);

            // Extract role from claim "role"
            String role = (String) claims.get("role");

            // Extract username/subject (recommended)
            String username = claims.getSubject(); // make sure you set subject in token

            // If you do NOT store subject, you can extract username from another claim
            // String username = (String) claims.get("username");

            if (role != null && username != null) {

                // Load user (recommended)
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // OPTIONAL but recommended: validate token against user details
                // if you have a method like jwtUtil.validateToken(jwt, userDetails)
                if (jwtUtil.validateToken(jwt, userDetails)) {

                    // Convert role claim to GrantedAuthorities
                    // If your role claim is "CLIENT" / "ADMIN" / "FREELANCER" -> OK
                    // If it is "ROLE_CLIENT" etc -> keep as-is or normalize (see note below)

                    Collection<? extends GrantedAuthority> authorities = AuthorityUtils.createAuthorityList(role);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            username, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                }
            }

        } catch (ExpiredJwtException e) {
            System.out.println("JWT expired: " + e.getMessage());
        } catch (SignatureException e) {
            System.out.println("JWT signature invalid: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("JWT malformed: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("JWT unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("JWT claims empty: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("JWT Error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
