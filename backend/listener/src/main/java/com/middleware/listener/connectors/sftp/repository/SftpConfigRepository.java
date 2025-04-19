package com.middleware.listener.connectors.sftp.repository;

import com.middleware.listener.connectors.sftp.model.SftpConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SftpConfigRepository extends JpaRepository<SftpConfig, Long> {
    List<SftpConfig> findByActiveTrue();
    Optional<SftpConfig> findByClient_IdAndInterfaceConfig_Id(Long clientId, Long interfaceId);
    List<SftpConfig> findByClient_Id(Long clientId);
    List<SftpConfig> findByInterfaceConfig_Id(Long interfaceId);
} 