package com.middleware.processor.security.config;

import com.middleware.processor.security.filter.JwtAuthenticationFilter;
import com.middleware.processor.security.service.JwtService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.Filter;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Value("${app.cors.allowed-methods}")
    private String allowedMethods;

    @Value("${app.cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${app.cors.allow-credentials}")
    private boolean allowCredentials;

    private final AuthenticationProvider authenticationProvider;
    private final CsrfTokenRepository csrfTokenRepository;
    private final CsrfTokenRequestAttributeHandler csrfTokenRequestHandler;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Autowired
    public SecurityConfig(
            AuthenticationProvider authenticationProvider,
            CsrfTokenRepository csrfTokenRepository,
            CsrfTokenRequestAttributeHandler csrfTokenRequestHandler,
            JwtService jwtService,
            UserDetailsService userDetailsService) {
        this.authenticationProvider = authenticationProvider;
        this.csrfTokenRepository = csrfTokenRepository;
        this.csrfTokenRequestHandler = csrfTokenRequestHandler;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        logger.info("SecurityConfig constructor executed");
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        logger.info("Creating JwtAuthenticationFilter bean");
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    @Bean
    @Order(1)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring API SecurityFilterChain");
        
        // Create the JWT filter
        JwtAuthenticationFilter jwtFilter = jwtAuthenticationFilter();
        logger.info("Created JwtAuthenticationFilter for security chain: {}", jwtFilter);

        // Configure security for API endpoints
        http
            .securityMatcher("/api/**")
            // Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Enable CSRF with proper configuration
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository)
                .csrfTokenRequestHandler(csrfTokenRequestHandler)
                .ignoringRequestMatchers("/api/auth/**")  // Ignore CSRF for authentication endpoints
            )
            // Add JWT filter explicitly before the UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // Allow OPTIONS requests
                .requestMatchers("/api/auth/**").permitAll()  // Public auth endpoints
                // Client endpoints
                .requestMatchers(HttpMethod.GET, "/api/clients/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/clients/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/clients/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/clients/**").hasRole("ADMIN")
                // Interface endpoints
                .requestMatchers(HttpMethod.GET, "/api/interfaces/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/interfaces/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/interfaces/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/interfaces/**").hasRole("ADMIN")
                // User management endpoints
                .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                // Mapping endpoints
                .requestMatchers(HttpMethod.GET, "/api/mapping/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/mapping/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/mapping/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/mapping/**").hasRole("ADMIN")
                // Secure everything else
                .anyRequest().authenticated()
            );

        DefaultSecurityFilterChain chain = http.build();
        
        // Log the filters in the chain for debugging
        logger.info("API filter chain created with {} filters", chain.getFilters().size());
        for (int i = 0; i < chain.getFilters().size(); i++) {
            Filter filter = chain.getFilters().get(i);
            logger.info("Filter {}: {}", i, filter.getClass().getSimpleName());
        }
        
        return chain;
    }

    @Bean
    @Order(2)
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring H2 Console SecurityFilterChain");
        
        http
            .securityMatcher("/h2-console/**")
            .csrf(AbstractHttpConfigurer::disable)
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));  // Frontend URL
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-XSRF-TOKEN", 
            "X-Requested-With", 
            "Accept", 
            "Origin", 
            "X-Client-ID"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 
