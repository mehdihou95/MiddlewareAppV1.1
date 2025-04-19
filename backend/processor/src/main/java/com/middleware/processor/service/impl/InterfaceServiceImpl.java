package com.middleware.processor.service.impl;

import com.middleware.processor.exception.ResourceNotFoundException;
import com.middleware.processor.exception.ValidationException;
import com.middleware.processor.model.Interface;
import com.middleware.processor.model.Client;
import com.middleware.processor.model.MappingRule;
import com.middleware.processor.repository.InterfaceRepository;
import com.middleware.processor.repository.MappingRuleRepository;
import com.middleware.processor.repository.ProcessedFileRepository;
import com.middleware.processor.service.interfaces.InterfaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;
import java.io.StringReader;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Primary implementation of the InterfaceService interface.
 * This service handles all interface-related operations including CRUD operations,
 * validation, and business logic for interface management.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class InterfaceServiceImpl implements InterfaceService {
    
    private final InterfaceRepository interfaceRepository;
    private final MappingRuleRepository mappingRuleRepository;
    private final ProcessedFileRepository processedFileRepository;
    private final Logger logger = LoggerFactory.getLogger(InterfaceServiceImpl.class);
    
    @Override
    public List<Interface> getAllInterfaces() {
        return interfaceRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Interface> getInterfaceById(Long id) {
        return interfaceRepository.findById(id);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "interfaces", allEntries = true)
    public Interface createInterface(Interface interfaceEntity) {
        validateInterface(interfaceEntity);
        
        // Fix schema path to be relative to classpath
        if (interfaceEntity.getSchemaPath() != null) {
            String schemaPath = interfaceEntity.getSchemaPath()
                .replace("backend/src/main/resources/", "")
                .replace("\\", "/");
            interfaceEntity.setSchemaPath(schemaPath);
        }
        
        return interfaceRepository.save(interfaceEntity);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "interfaces", key = "#id")
    public Interface updateInterface(Long id, Interface interfaceEntity) {
        // Verify interface exists and get the existing entity
        Interface existingInterface = interfaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Interface not found with id: " + id));
        
        validateInterface(interfaceEntity);
        
        // Fix schema path to be relative to classpath
        if (interfaceEntity.getSchemaPath() != null) {
            String schemaPath = interfaceEntity.getSchemaPath()
                .replace("backend/src/main/resources/", "")
                .replace("\\", "/");
            interfaceEntity.setSchemaPath(schemaPath);
        } else {
            // Preserve existing schema path if not provided
            interfaceEntity.setSchemaPath(existingInterface.getSchemaPath());
        }
        
        // Preserve existing fields that shouldn't be modified
        interfaceEntity.setId(id);
        interfaceEntity.setCreatedAt(existingInterface.getCreatedAt());
        interfaceEntity.setClient(existingInterface.getClient());
        
        // Set the update timestamp
        interfaceEntity.setUpdatedAt(LocalDateTime.now());
        
        return interfaceRepository.save(interfaceEntity);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "interfaces", key = "#id")
    public void deleteInterface(Long id) {
        logger.info("Deleting interface with ID: {}", id);
        try {
            // First delete all mapping rules associated with this interface
            logger.debug("Deleting mapping rules for interface ID: {}", id);
            mappingRuleRepository.deleteByInterfaceId(id);

            // Then delete all processed files associated with this interface
            logger.debug("Deleting processed files for interface ID: {}", id);
            processedFileRepository.deleteByInterfaceId(id);

            // Finally delete the interface itself
            logger.debug("Deleting interface record with ID: {}", id);
            interfaceRepository.deleteById(id);
            
            logger.info("Successfully deleted interface and all related records for ID: {}", id);
        } catch (Exception e) {
            logger.error("Failed to delete interface with ID: {}. Error: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete interface: " + e.getMessage());
        }
    }
    
    @Override
    public List<Interface> getInterfacesByClient(Client client) {
        return interfaceRepository.findByClient(client);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Interface> getClientInterfaces(Long clientId) {
        return interfaceRepository.findByClient_Id(clientId);
    }
    
    @Override
    public Optional<Interface> getInterfaceByName(String name, Long clientId) {
        return interfaceRepository.findByNameAndClient_Id(name, clientId);
    }
    
    @Override
    @Cacheable(value = "interfaces", key = "'all'")
    public Page<Interface> getAllInterfaces(Pageable pageable) {
        return interfaceRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Interface> getInterfacesByClient(Long clientId, Pageable pageable) {
        return interfaceRepository.findByClient_Id(clientId, pageable);
    }
    
    @Override
    public Page<Interface> getInterfacesByClient(Long clientId, int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return interfaceRepository.findByClient_Id(clientId, pageRequest);
    }
    
    @Override
    public Page<Interface> getInterfaces(int page, int size, String sortBy, String sortDirection, 
                                       String searchTerm, Boolean isActive) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return interfaceRepository.findByNameContaining(searchTerm, pageRequest);
        } else if (isActive != null) {
            return interfaceRepository.findByIsActive(isActive, pageRequest);
        }
        
        return interfaceRepository.findAll(pageRequest);
    }
    
    @Override
    @Cacheable(value = "interfaces", key = "'search_' + #name")
    public Page<Interface> searchInterfaces(String name, Pageable pageable) {
        return interfaceRepository.findByNameContaining(name, pageable);
    }
    
    @Override
    public Page<Interface> searchInterfaces(String searchTerm, int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return interfaceRepository.findByNameContaining(searchTerm, pageRequest);
    }
    
    @Override
    public Page<Interface> getInterfacesByType(String type, int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return interfaceRepository.findByType(type, pageRequest);
    }
    
    @Override
    @Cacheable(value = "interfaces", key = "'active_' + #isActive")
    public Page<Interface> getInterfacesByStatus(boolean isActive, Pageable pageable) {
        return interfaceRepository.findByIsActive(isActive, pageable);
    }
    
    @Override
    public Page<Interface> getInterfacesByStatus(boolean isActive, int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return interfaceRepository.findByIsActive(isActive, pageRequest);
    }
    
    @Override
    public Interface detectInterface(String xmlContent, Long clientId) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new InputSource(new StringReader(xmlContent)));
            Element root = document.getDocumentElement();
            
            if (root == null) {
                throw new ValidationException("Invalid XML: root element is null");
            }
            
            // Check root element name
            String rootName = root.getNodeName();
            
            // Check for specific elements that indicate interface type
            if (root.getElementsByTagName("InvoiceNumber").getLength() > 0) {
                return createInterface("INVOICE", rootName, clientId);
            } else if (root.getElementsByTagName("OrderNumber").getLength() > 0) {
                return createInterface("ORDER", rootName, clientId);
            } else if (root.getElementsByTagName("ShipmentNumber").getLength() > 0) {
                return createInterface("SHIPMENT", rootName, clientId);
            }
            
            // Default fallback based on root element
            if (rootName.contains("Invoice")) {
                return createInterface("INVOICE", rootName, clientId);
            } else if (rootName.contains("Order")) {
                return createInterface("ORDER", rootName, clientId);
            } else if (rootName.contains("Shipment")) {
                return createInterface("SHIPMENT", rootName, clientId);
            }
            
            throw new ValidationException("Could not detect interface type from XML content");
        } catch (Exception e) {
            log.error("Failed to detect interface type", e);
            throw new ValidationException("Failed to detect interface type: " + e.getMessage());
        }
    }
    
    private Interface createInterface(String type, String rootElement, Long clientId) {
        Interface interfaceEntity = new Interface();
        interfaceEntity.setType(type);
        interfaceEntity.setRootElement(rootElement);
        interfaceEntity.setNamespace("http://xml.processor.com/" + type.toLowerCase());
        interfaceEntity.setActive(true);
        interfaceEntity.setName(type + "_" + rootElement);
        
        Client client = new Client();
        client.setId(clientId);
        interfaceEntity.setClient(client);
        
        return interfaceEntity;
    }
    
    /**
     * Validates an interface entity before saving.
     *
     * @param interfaceEntity The interface to validate
     * @throws ValidationException if the interface is invalid
     */
    private void validateInterface(Interface interfaceEntity) {
        if (interfaceEntity.getName() == null || interfaceEntity.getName().trim().isEmpty()) {
            throw new ValidationException("Interface name is required");
        }

        if (interfaceEntity.getClient() == null || interfaceEntity.getClient().getId() == null) {
            throw new ValidationException("Client is required");
        }

        // For updates, check if another interface with the same name exists for this client
        if (interfaceEntity.getId() != null) {
            boolean exists = interfaceRepository.existsByNameAndClient_IdAndIdNot(
                interfaceEntity.getName(),
                interfaceEntity.getClient().getId(),
                interfaceEntity.getId()
            );
            if (exists) {
                throw new ValidationException("Another interface with name " + interfaceEntity.getName() +
                    " already exists for this client");
            }
        } else {
            // For new interfaces, check if any interface with this name exists for this client
            boolean exists = interfaceRepository.existsByNameAndClient_Id(
                interfaceEntity.getName(),
                interfaceEntity.getClient().getId()
            );
            if (exists) {
                throw new ValidationException("Interface with name " + interfaceEntity.getName() +
                    " already exists for this client");
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByNameAndClientId(String name, Long clientId) {
        return interfaceRepository.existsByNameAndClient_Id(name, clientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MappingRule> getInterfaceMappings(Long interfaceId) {
        return mappingRuleRepository.findByInterfaceId(interfaceId);
    }

    @Override
    @Transactional
    @CacheEvict(value = "interfaces", key = "#interfaceId")
    public List<MappingRule> updateInterfaceMappings(Long interfaceId, List<MappingRule> mappings) {
        try {
            Interface interfaceEntity = interfaceRepository.findById(interfaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Interface not found with id: " + interfaceId));
            
            // Validate client relationship
            Client client = interfaceEntity.getClient();
            if (client == null) {
                throw new ValidationException("Interface must have a client");
            }
            
            // Clear existing mappings
            mappingRuleRepository.deleteByInterfaceId(interfaceId);
            
            // Add new mappings
            return mappings.stream()
                .filter(mapping -> mapping != null)
                .map(mapping -> {
                    try {
                        // Validate required fields
                        if (mapping.getName() == null || mapping.getName().trim().isEmpty()) {
                            throw new ValidationException("Mapping name is required");
                        }
                        
                        // Handle xmlPath/sourceField
                        String xmlPath = mapping.getXmlPath();
                        if (xmlPath == null || xmlPath.trim().isEmpty()) {
                            xmlPath = mapping.getSourceField();
                        }
                        if (xmlPath == null || xmlPath.trim().isEmpty()) {
                            throw new ValidationException("XML path or source field is required");
                        }
                        
                        // Handle databaseField/targetField
                        String databaseField = mapping.getDatabaseField();
                        if (databaseField == null || databaseField.trim().isEmpty()) {
                            databaseField = mapping.getTargetField();
                        }
                        if (databaseField == null || databaseField.trim().isEmpty()) {
                            throw new ValidationException("Database field or target field is required");
                        }
                        
                        // Create a new mapping rule to avoid ID conflicts
                        MappingRule newMapping = new MappingRule();
                        newMapping.setName(mapping.getName());
                        newMapping.setXmlPath(xmlPath);
                        newMapping.setDatabaseField(databaseField);
                        newMapping.setTransformation(mapping.getTransformation());
                        newMapping.setRequired(mapping.isRequired());
                        newMapping.setDefaultValue(mapping.getDefaultValue());
                        newMapping.setPriority(mapping.getPriority() != null ? mapping.getPriority() : 0);
                        newMapping.setDescription(mapping.getDescription());
                        newMapping.setValidationRule(mapping.getValidationRule());
                        newMapping.setDataType(mapping.getDataType());
                        newMapping.setIsAttribute(mapping.isAttribute());
                        newMapping.setXsdElement(mapping.getXsdElement());
                        newMapping.setIsDefault(mapping.getIsDefault());
                        newMapping.setTransformationRule(mapping.getTransformationRule());
                        newMapping.setTableName(mapping.getTableName());
                        newMapping.setIsActive(true);
                        
                        // Set relationships
                        newMapping.setInterfaceEntity(interfaceEntity);
                        newMapping.setClient(client);
                        
                        // Save the mapping
                        return mappingRuleRepository.save(newMapping);
                    } catch (Exception e) {
                        log.error("Failed to save mapping rule: {}", mapping.getName(), e);
                        throw new RuntimeException("Failed to save mapping rule: " + mapping.getName() + " - " + e.getMessage(), e);
                    }
                }).toList();
        } catch (Exception e) {
            log.error("Failed to update mappings", e);
            throw new RuntimeException("Failed to update mappings: " + e.getMessage(), e);
        }
    }
} 
