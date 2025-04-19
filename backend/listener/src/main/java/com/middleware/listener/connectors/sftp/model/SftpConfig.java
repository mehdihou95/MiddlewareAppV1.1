package com.middleware.listener.connectors.sftp.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.middleware.listener.model.Client;
import com.middleware.listener.model.Interface;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sftp_config")
@Data
@NoArgsConstructor
public class SftpConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "interface_id", nullable = false)
    private Interface interfaceConfig;

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private Integer port = 22;

    @Column(nullable = false)
    private String username;

    private String password;

    @Column(name = "private_key_path")
    private String privateKeyPath;

    @Column(name = "private_key_passphrase")
    private String privateKeyPassphrase;

    @Column(name = "monitored_directories", columnDefinition = "json", nullable = false)
    private String monitoredDirectoriesJson;

    @Column(name = "processed_directory", nullable = false)
    private String processedDirectory;

    @Column(name = "error_directory", nullable = false)
    private String errorDirectory;

    @Column(name = "connection_timeout")
    private Integer connectionTimeout = 5000;

    @Column(name = "channel_timeout")
    private Integer channelTimeout = 30000;

    @Column(name = "thread_pool_size")
    private Integer threadPoolSize = 4;

    @Column(name = "retry_attempts")
    private Integer retryAttempts = 3;

    @Column(name = "retry_delay")
    private Integer retryDelay = 5000;

    @Column(name = "polling_interval")
    private Integer pollingInterval = 60000;

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for JSON conversion
    public List<String> getMonitoredDirectoriesAsList() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(monitoredDirectoriesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public void setMonitoredDirectoriesFromList(List<String> directories) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.monitoredDirectoriesJson = mapper.writeValueAsString(directories);
        } catch (Exception e) {
            this.monitoredDirectoriesJson = "[]";
        }
    }
} 