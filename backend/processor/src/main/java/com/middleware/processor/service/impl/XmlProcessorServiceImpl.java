package com.middleware.processor.service.impl;

import com.middleware.processor.exception.ValidationException;
import com.middleware.processor.model.ProcessedFile;
import com.middleware.processor.model.Interface;
import com.middleware.processor.repository.InterfaceRepository;
import com.middleware.processor.service.interfaces.ProcessedFileService;
import com.middleware.processor.service.interfaces.XmlProcessorService;
import com.middleware.processor.service.interfaces.DocumentProcessingStrategyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.TransactionDefinition;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Implementation of XmlProcessorService.
 * Provides operations for validating, transforming, and processing XML files.
 */
@Service
public class XmlProcessorServiceImpl implements XmlProcessorService {

    private static final Logger log = LoggerFactory.getLogger(XmlProcessorServiceImpl.class);

    @Autowired
    private ProcessedFileService processedFileService;

    @Autowired
    private InterfaceRepository interfaceRepository;

    @Autowired
    private DocumentProcessingStrategyService strategyService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Override
    @Transactional
    public ProcessedFile processXmlFile(MultipartFile file, Interface interfaceEntity) {
        // Initialize lazy-loaded associations
        Hibernate.initialize(interfaceEntity.getClient());
        return strategyService.processDocument(file, interfaceEntity);
    }

    @Override
    public boolean validateXmlFile(MultipartFile file, Interface interfaceEntity) {
        try {
            ProcessedFile result = strategyService.processDocument(file, interfaceEntity);
            return "SUCCESS".equals(result.getStatus());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public String transformXmlFile(MultipartFile file, Interface interfaceEntity) {
        ProcessedFile result = strategyService.processDocument(file, interfaceEntity);
        if (!"SUCCESS".equals(result.getStatus())) {
            throw new ValidationException("Failed to transform XML file: " + result.getErrorMessage());
        }
        return result.getContent();
    }

    @Override
    @Transactional
    public ProcessedFile processXmlFile(MultipartFile file) {
        // For now, throw UnsupportedOperationException as this method needs to be implemented
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public CompletableFuture<ProcessedFile> processXmlFileAsync(MultipartFile file, Long interfaceId) {
        return CompletableFuture.supplyAsync(() -> {
            AtomicReference<ProcessedFile> processedFileRef = new AtomicReference<>(new ProcessedFile());
            TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
            transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
            transactionTemplate.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
            
            try {
                // First transaction: Load interface and initialize basic file record
                processedFileRef.set(transactionTemplate.execute(status -> {
                    Interface interfaceEntity = interfaceRepository.findById(interfaceId)
                        .orElseThrow(() -> new ValidationException("Interface not found with id: " + interfaceId));
                    Hibernate.initialize(interfaceEntity.getClient());
                    
                    // Create initial record
                    ProcessedFile processedFile = processedFileRef.get();
                    processedFile.setFileName(file.getOriginalFilename());
                    processedFile.setStatus("PROCESSING");
                    processedFile.setInterfaceEntity(interfaceEntity);
                    processedFile.setClient(interfaceEntity.getClient());
                    processedFile.setProcessedAt(LocalDateTime.now());
                    return processedFileService.createProcessedFile(processedFile);
                }));

                // Second transaction: Process the file
                TransactionTemplate processingTemplate = new TransactionTemplate(transactionManager);
                processingTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
                processingTemplate.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
                
                return processingTemplate.execute(status -> {
                    try {
                        Interface interfaceEntity = interfaceRepository.findById(interfaceId)
                            .orElseThrow(() -> new ValidationException("Interface not found with id: " + interfaceId));
                        Hibernate.initialize(interfaceEntity.getClient());
                        
                        log.debug("Starting XML file processing with interface: {}", interfaceEntity.getName());
                        final ProcessedFile result;
                        
                        try {
                            result = processXmlFile(file, interfaceEntity);
                            log.debug("XML processing completed. Result status: {}", result.getStatus());
                            
                            // Update existing record instead of creating new one
                            ProcessedFile existingFile = processedFileRef.get();
                            existingFile.setStatus(result.getStatus());
                            if (result.getErrorMessage() != null) {
                                existingFile.setErrorMessage(result.getErrorMessage());
                            }
                            existingFile.setContent(result.getContent());
                            return processedFileService.updateProcessedFile(existingFile.getId(), existingFile);
                        } catch (Exception processingError) {
                            log.error("Error in XML processing: ", processingError);
                            throw processingError;
                        }
                    } catch (Exception e) {
                        log.error("Error processing file: ", e);
                        
                        // Only update the status to ERROR, preserve the existing error message
                        ProcessedFile existingFile = processedFileRef.get();
                        existingFile.setStatus("ERROR");
                        // Do not update error message here to preserve the original one
                        log.debug("Updating processed file status to ERROR while preserving error message");
                        return processedFileService.updateProcessedFile(existingFile.getId(), existingFile);
                    }
                });
            } catch (Exception e) {
                log.error("Critical error: ", e);
                log.debug("Detailed critical error context: ", e);
                
                // Only update the status to ERROR, preserve the existing error message
                ProcessedFile existingFile = processedFileRef.get();
                existingFile.setStatus("ERROR");
                // Do not update error message here to preserve the original one
                return processedFileService.updateProcessedFile(existingFile.getId(), existingFile);
            }
        });
    }

    @Override
    @Transactional
    public void reprocessFile(Long fileId) {
        // For now, throw UnsupportedOperationException as this method needs to be implemented
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessedFile> getProcessedFiles() {
        return processedFileService.getProcessedFilesByStatus("SUCCESS");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessedFile> getErrorFiles() {
        return processedFileService.getProcessedFilesByStatus("ERROR");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProcessedFile> getProcessedFiles(Pageable pageable) {
        return processedFileService.getProcessedFilesByStatus("SUCCESS", pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProcessedFile> getErrorFiles(Pageable pageable) {
        return processedFileService.getProcessedFilesByStatus("ERROR", pageable);
    }
} 
