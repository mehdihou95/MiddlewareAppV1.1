package com.middleware.listener.connectors.sftp.service;

import com.middleware.listener.connectors.sftp.model.SftpConfig;
import com.middleware.listener.connectors.sftp.repository.SftpConfigRepository;
import com.middleware.listener.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SftpConfigService {
    private final SftpConfigRepository sftpConfigRepository;

    @Transactional(readOnly = true)
    public List<SftpConfig> getAllConfigurations() {
        return sftpConfigRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<SftpConfig> getActiveConfigurations() {
        return sftpConfigRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public SftpConfig getConfiguration(Long id) {
        return sftpConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SFTP Configuration not found with id: " + id));
    }

    @Transactional
    public SftpConfig createConfiguration(SftpConfig config) {
        log.info("Creating new SFTP configuration for client: {} and interface: {}", 
                config.getClient().getId(), config.getInterfaceConfig().getId());
        return sftpConfigRepository.save(config);
    }

    @Transactional
    public SftpConfig updateConfiguration(Long id, SftpConfig config) {
        SftpConfig existingConfig = getConfiguration(id);
        
        // Update fields
        existingConfig.setHost(config.getHost());
        existingConfig.setPort(config.getPort());
        existingConfig.setUsername(config.getUsername());
        existingConfig.setPassword(config.getPassword());
        existingConfig.setPrivateKeyPath(config.getPrivateKeyPath());
        existingConfig.setPrivateKeyPassphrase(config.getPrivateKeyPassphrase());
        existingConfig.setMonitoredDirectoriesJson(config.getMonitoredDirectoriesJson());
        existingConfig.setProcessedDirectory(config.getProcessedDirectory());
        existingConfig.setErrorDirectory(config.getErrorDirectory());
        existingConfig.setConnectionTimeout(config.getConnectionTimeout());
        existingConfig.setChannelTimeout(config.getChannelTimeout());
        existingConfig.setThreadPoolSize(config.getThreadPoolSize());
        existingConfig.setRetryAttempts(config.getRetryAttempts());
        existingConfig.setRetryDelay(config.getRetryDelay());
        existingConfig.setPollingInterval(config.getPollingInterval());
        existingConfig.setActive(config.isActive());

        log.info("Updating SFTP configuration with id: {}", id);
        return sftpConfigRepository.save(existingConfig);
    }

    @Transactional
    public void deleteConfiguration(Long id) {
        log.info("Deleting SFTP configuration with id: {}", id);
        sftpConfigRepository.deleteById(id);
    }

    @Transactional
    public SftpConfig toggleActive(Long id) {
        SftpConfig config = getConfiguration(id);
        config.setActive(!config.isActive());
        log.info("Toggling active status for SFTP configuration with id: {} to: {}", id, config.isActive());
        return sftpConfigRepository.save(config);
    }

    @Transactional(readOnly = true)
    public List<SftpConfig> getConfigurationsByClient(Long clientId) {
        return sftpConfigRepository.findByClient_Id(clientId);
    }

    @Transactional(readOnly = true)
    public List<SftpConfig> getConfigurationsByInterface(Long interfaceId) {
        return sftpConfigRepository.findByInterfaceConfig_Id(interfaceId);
    }

    @Transactional(readOnly = true)
    public SftpConfig getConfigurationByClientAndInterface(Long clientId, Long interfaceId) {
        return sftpConfigRepository.findByClient_IdAndInterfaceConfig_Id(clientId, interfaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    String.format("SFTP Configuration not found for client: %d and interface: %d", clientId, interfaceId)));
    }
} 