package com.middleware.listener.connectors.sftp.controller;

import com.middleware.listener.connectors.sftp.model.SftpConfig;
import com.middleware.listener.connectors.sftp.service.SftpConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/sftp/config")
@RequiredArgsConstructor
public class SftpConfigController {
    private final SftpConfigService sftpConfigService;

    @GetMapping
    public ResponseEntity<List<SftpConfig>> getAllConfigurations() {
        return ResponseEntity.ok(sftpConfigService.getAllConfigurations());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SftpConfig>> getActiveConfigurations() {
        return ResponseEntity.ok(sftpConfigService.getActiveConfigurations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SftpConfig> getConfiguration(@PathVariable Long id) {
        return ResponseEntity.ok(sftpConfigService.getConfiguration(id));
    }

    @PostMapping
    public ResponseEntity<SftpConfig> createConfiguration(@Valid @RequestBody SftpConfig config) {
        return ResponseEntity.ok(sftpConfigService.createConfiguration(config));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SftpConfig> updateConfiguration(
            @PathVariable Long id,
            @Valid @RequestBody SftpConfig config) {
        return ResponseEntity.ok(sftpConfigService.updateConfiguration(id, config));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable Long id) {
        sftpConfigService.deleteConfiguration(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<SftpConfig> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(sftpConfigService.toggleActive(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<SftpConfig>> getConfigurationsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(sftpConfigService.getConfigurationsByClient(clientId));
    }

    @GetMapping("/interface/{interfaceId}")
    public ResponseEntity<List<SftpConfig>> getConfigurationsByInterface(@PathVariable Long interfaceId) {
        return ResponseEntity.ok(sftpConfigService.getConfigurationsByInterface(interfaceId));
    }

    @GetMapping("/client/{clientId}/interface/{interfaceId}")
    public ResponseEntity<SftpConfig> getConfigurationByClientAndInterface(
            @PathVariable Long clientId,
            @PathVariable Long interfaceId) {
        return ResponseEntity.ok(sftpConfigService.getConfigurationByClientAndInterface(clientId, interfaceId));
    }
} 