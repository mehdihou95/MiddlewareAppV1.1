package com.middleware.processor.service.impl;

import com.middleware.processor.exception.ValidationException;
import com.middleware.processor.model.Interface;
import com.middleware.processor.model.ProcessedFile;
import com.middleware.processor.service.interfaces.DocumentProcessingStrategyService;
import com.middleware.processor.service.strategy.DocumentProcessingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of DocumentProcessingStrategyService.
 * Manages different document processing strategies and routes documents to the appropriate strategy.
 */
@Service
public class DocumentProcessingStrategyServiceImpl implements DocumentProcessingStrategyService {

    private final Map<String, DocumentProcessingStrategy> strategyMap = new ConcurrentHashMap<>();

    @Autowired
    public DocumentProcessingStrategyServiceImpl(List<DocumentProcessingStrategy> strategies) {
        strategies.forEach(strategy -> strategyMap.put(strategy.getDocumentType(), strategy));
    }

    @Override
    public ProcessedFile processDocument(MultipartFile file, Interface interfaceEntity) {
        DocumentProcessingStrategy strategy = getStrategy(interfaceEntity.getType());
        if (strategy == null) {
            throw new ValidationException("No processing strategy found for interface type: " + interfaceEntity.getType());
        }
        return strategy.processDocument(file, interfaceEntity);
    }

    @Override
    public DocumentProcessingStrategy getStrategy(String interfaceType) {
        return strategyMap.get(interfaceType);
    }
} 
