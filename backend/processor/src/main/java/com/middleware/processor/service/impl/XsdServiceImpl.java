package com.middleware.processor.service.impl;

import com.middleware.processor.exception.ValidationException;
import com.middleware.processor.model.Interface;
import com.middleware.processor.model.MappingRule;
import com.middleware.processor.repository.MappingRuleRepository;
import com.middleware.processor.service.interfaces.XsdService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of XsdService.
 * Provides operations for validating and processing XSD files.
 */
@Slf4j
@Service
public class XsdServiceImpl implements XsdService {

    @Autowired
    private MappingRuleRepository mappingRuleRepository;

    @Override
    public boolean validateXsdSchema(MultipartFile file) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setValidating(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            builder.parse(file.getInputStream());
            return true;
        } catch (ParserConfigurationException | SAXException | IOException e) {
            return false;
        }
    }

    @Override
    public Interface processXsdSchema(MultipartFile file, Interface interfaceEntity) {
        if (!validateXsdSchema(file)) {
            throw new ValidationException("Invalid XSD schema");
        }

        String rootElement = getRootElement(file);
        String namespace = getNamespace(file);

        interfaceEntity.setRootElement(rootElement);
        interfaceEntity.setNamespace(namespace);
        interfaceEntity.setSchemaPath(file.getOriginalFilename());

        return interfaceEntity;
    }

    @Override
    public String getRootElement(MultipartFile file) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(file.getInputStream());
            Element root = document.getDocumentElement();
            return root.getLocalName();
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new ValidationException("Failed to get root element from XSD schema", e);
        }
    }

    @Override
    public String getNamespace(MultipartFile file) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(file.getInputStream());
            Element root = document.getDocumentElement();
            return root.getNamespaceURI();
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new ValidationException("Failed to get namespace from XSD schema", e);
        }
    }

    @Override
    public List<Map<String, Object>> getXsdStructure(String xsdPath) {
        try {
            if (xsdPath == null || xsdPath.trim().isEmpty()) {
                throw new ValidationException("XSD path cannot be null or empty");
            }

            // Normalize path separators to forward slashes
            String normalizedPath = xsdPath.replace("\\", "/");
            
            // Handle relative path from resources directory
            String resourcePath = normalizedPath;
            if (normalizedPath.startsWith("backend/src/main/resources/")) {
                resourcePath = normalizedPath.substring("backend/src/main/resources/".length());
            }
            
            // Try loading from classpath first
            InputStream inputStream = null;
            try {
                ClassPathResource resource = new ClassPathResource(resourcePath);
                inputStream = resource.getInputStream();
            } catch (IOException e) {
                // If not found in classpath, try absolute path
                Path absolutePath = Paths.get(normalizedPath);
                if (Files.exists(absolutePath)) {
                    inputStream = Files.newInputStream(absolutePath);
                } else {
                    // Try one more time with just the filename from resources
                    try {
                        String fileName = Paths.get(resourcePath).getFileName().toString();
                        ClassPathResource resource = new ClassPathResource(fileName);
                        inputStream = resource.getInputStream();
                    } catch (IOException e2) {
                        throw new ValidationException(
                            String.format("XSD file not found. Tried:\n" +
                                        "- Classpath: %s\n" +
                                        "- Absolute path: %s\n" +
                                        "- Resources filename: %s",
                                        resourcePath, normalizedPath, Paths.get(resourcePath).getFileName())
                        );
                    }
                }
            }
            
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(inputStream);
            Element root = document.getDocumentElement();
            
            List<Map<String, Object>> structure = new ArrayList<>();
            
            // Add schema info
            Map<String, Object> schemaInfo = new HashMap<>();
            schemaInfo.put("name", root.getLocalName());
            schemaInfo.put("type", "schema");
            schemaInfo.put("namespace", root.getNamespaceURI());
            
            // Add any schema-level attributes
            NamedNodeMap attributes = root.getAttributes();
            if (attributes != null && attributes.getLength() > 0) {
                Map<String, String> schemaAttributes = new HashMap<>();
                for (int i = 0; i < attributes.getLength(); i++) {
                    Node attr = attributes.item(i);
                    schemaAttributes.put(attr.getLocalName(), attr.getNodeValue());
                }
                schemaInfo.put("attributes", schemaAttributes);
            }
            structure.add(schemaInfo);
            
            // Get all global element declarations
            NodeList elements = document.getElementsByTagNameNS(root.getNamespaceURI(), "element");
            for (int i = 0; i < elements.getLength(); i++) {
                Element element = (Element) elements.item(i);
                // Only process global elements (those that are direct children of schema)
                if (element.getParentNode().equals(root)) {
                    Map<String, Object> elementInfo = processElement(element);
                    structure.add(elementInfo);
                }
            }
            
            return structure;
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new ValidationException("Failed to analyze XSD structure: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> processElement(Element element) {
        Map<String, Object> elementInfo = new HashMap<>();
        elementInfo.put("name", element.getAttribute("name"));
        
        // Handle type attribute
        String type = element.getAttribute("type");
        if (!type.isEmpty()) {
            elementInfo.put("type", type);
        }
        
        // Handle all attributes
        NamedNodeMap attributes = element.getAttributes();
        if (attributes != null) {
            for (int i = 0; i < attributes.getLength(); i++) {
                Node attr = attributes.item(i);
                String attrName = attr.getLocalName();
                String value = attr.getNodeValue();
                if (!value.isEmpty() && !attrName.equals("name") && !attrName.equals("type")) {
                    elementInfo.put(attrName, value);
                }
            }
        }
        
        // Handle annotation/documentation if present
        NodeList annotations = element.getElementsByTagNameNS(element.getNamespaceURI(), "annotation");
        if (annotations.getLength() > 0) {
            Element annotation = (Element) annotations.item(0);
            NodeList docs = annotation.getElementsByTagNameNS(element.getNamespaceURI(), "documentation");
            if (docs.getLength() > 0) {
                elementInfo.put("documentation", docs.item(0).getTextContent().trim());
            }
        }
        
        // Process complex type if present
        NodeList complexTypes = element.getElementsByTagNameNS(element.getNamespaceURI(), "complexType");
        if (complexTypes.getLength() > 0) {
            Element complexType = (Element) complexTypes.item(0);
            elementInfo.put("hasComplexType", true);
            
            // Process sequence, choice, or all elements
            for (String compositor : new String[]{"sequence", "choice", "all"}) {
                NodeList compositors = complexType.getElementsByTagNameNS(element.getNamespaceURI(), compositor);
                if (compositors.getLength() > 0) {
                    Element compositorElement = (Element) compositors.item(0);
                    elementInfo.put("compositor", compositor);
                    
                    NodeList childElements = compositorElement.getElementsByTagNameNS(element.getNamespaceURI(), "element");
                    List<Map<String, Object>> children = new ArrayList<>();
                    
                    for (int i = 0; i < childElements.getLength(); i++) {
                        Element childElement = (Element) childElements.item(i);
                        // Only process immediate children
                        if (childElement.getParentNode().equals(compositorElement)) {
                            children.add(processElement(childElement));
                        }
                    }
                    
                    elementInfo.put("elements", children);
                    break; // Only process the first compositor found
                }
            }
        }
        
        // Process simple type if present
        NodeList simpleTypes = element.getElementsByTagNameNS(element.getNamespaceURI(), "simpleType");
        if (simpleTypes.getLength() > 0) {
            Element simpleType = (Element) simpleTypes.item(0);
            elementInfo.put("hasSimpleType", true);
            
            // Process restrictions
            NodeList restrictions = simpleType.getElementsByTagNameNS(element.getNamespaceURI(), "restriction");
            if (restrictions.getLength() > 0) {
                Element restriction = (Element) restrictions.item(0);
                elementInfo.put("baseType", restriction.getAttribute("base"));
                
                // Process facets (enumeration, pattern, etc.)
                NodeList facets = restriction.getChildNodes();
                List<Map<String, String>> facetList = new ArrayList<>();
                for (int i = 0; i < facets.getLength(); i++) {
                    Node facet = facets.item(i);
                    if (facet.getNodeType() == Node.ELEMENT_NODE) {
                        Map<String, String> facetInfo = new HashMap<>();
                        facetInfo.put("type", facet.getLocalName());
                        facetInfo.put("value", ((Element) facet).getAttribute("value"));
                        facetList.add(facetInfo);
                    }
                }
                if (!facetList.isEmpty()) {
                    elementInfo.put("facets", facetList);
                }
            }
        }
        
        return elementInfo;
    }

    @Override
    public List<Map<String, Object>> getXsdStructure(String xsdPath, Long clientId) {
        List<Map<String, Object>> structure = getXsdStructure(xsdPath);
        
        // Add client-specific customizations
        List<MappingRule> clientRules = mappingRuleRepository.findByClient_Id(clientId);
        for (MappingRule rule : clientRules) {
            Map<String, Object> ruleInfo = Map.of(
                "name", rule.getName(),
                "xmlPath", rule.getXmlPath(),
                "databaseField", rule.getDatabaseField(),
                "type", "mapping_rule"
            );
            structure.add(ruleInfo);
        }
        
        return structure;
    }

    @Override
    public Page<MappingRule> getAllMappingRules(Pageable pageable) {
        return mappingRuleRepository.findAll(pageable);
    }

    @Override
    public Page<MappingRule> getMappingRulesByClient(Long clientId, Pageable pageable) {
        return mappingRuleRepository.findByClient_Id(clientId, pageable);
    }

    @Override
    public Page<MappingRule> getMappingRulesByInterface(Long interfaceId, Pageable pageable) {
        return mappingRuleRepository.findByInterfaceId(interfaceId, pageable);
    }

    @Override
    public Page<MappingRule> getMappingRulesByClientAndInterface(Long clientId, Long interfaceId, Pageable pageable) {
        return mappingRuleRepository.findByClient_IdAndInterfaceEntity_Id(clientId, interfaceId, pageable);
    }

    @Override
    public void deleteMappingRule(Long id) {
        mappingRuleRepository.deleteById(id);
    }

    @Override
    public List<MappingRule> getActiveMappingRules(Long interfaceId) {
        return mappingRuleRepository.findByInterfaceIdAndIsActiveTrue(interfaceId);
    }

    @Override
    public List<MappingRule> findByTableNameAndClient_Id(String tableName, Long clientId) {
        return mappingRuleRepository.findByTableNameAndClient_Id(tableName, clientId);
    }

    @Override
    public void deleteByClient_IdAndTableName(Long clientId, String tableName) {
        mappingRuleRepository.deleteByClient_IdAndTableName(clientId, tableName);
    }

    @Override
    public String analyzeXsdStructure(MultipartFile file) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(file.getInputStream());
            Element root = document.getDocumentElement();
            
            StringBuilder analysis = new StringBuilder();
            analysis.append("XSD Schema Analysis:\n");
            analysis.append("Root Element: ").append(root.getLocalName()).append("\n");
            analysis.append("Namespace: ").append(root.getNamespaceURI()).append("\n");
            
            // Analyze child elements
            NodeList elements = root.getElementsByTagName("xsd:element");
            analysis.append("\nElements found: ").append(elements.getLength()).append("\n");
            
            for (int i = 0; i < elements.getLength(); i++) {
                Element element = (Element) elements.item(i);
                String name = element.getAttribute("name");
                String minOccurs = element.getAttribute("minOccurs");
                String maxOccurs = element.getAttribute("maxOccurs");
                
                analysis.append("\nElement: ").append(name);
                if (!minOccurs.isEmpty()) {
                    analysis.append(", minOccurs: ").append(minOccurs);
                }
                if (!maxOccurs.isEmpty()) {
                    analysis.append(", maxOccurs: ").append(maxOccurs);
                }
                analysis.append("\n");
            }
            
            return analysis.toString();
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new ValidationException("Failed to analyze XSD structure", e);
        }
    }

    @Override
    public String analyzeXsdStructureWithClient(MultipartFile file, Long clientId) {
        // First get the basic structure analysis
        String basicAnalysis = analyzeXsdStructure(file);
        
        // Add client-specific analysis
        StringBuilder clientAnalysis = new StringBuilder(basicAnalysis);
        clientAnalysis.append("\nClient-specific Analysis (Client ID: ").append(clientId).append("):\n");
        
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            builder.parse(file.getInputStream());
            
            // Add client-specific validation rules or customizations
            List<MappingRule> clientRules = mappingRuleRepository.findByClient_Id(clientId);
            clientAnalysis.append("\nClient-specific Mapping Rules:\n");
            for (MappingRule rule : clientRules) {
                clientAnalysis.append("- ").append(rule.getName())
                    .append(" (").append(rule.getXmlPath())
                    .append(" -> ").append(rule.getDatabaseField())
                    .append(")\n");
            }
            
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new ValidationException("Failed to analyze XSD structure with client context", e);
        }
        
        return clientAnalysis.toString();
    }

    @Override
    public List<MappingRule> getMappingRules(Long clientId) {
        return mappingRuleRepository.findByClient_Id(clientId);
    }

    @Override
    public List<MappingRule> getMappingRulesByTableName(String tableName) {
        return mappingRuleRepository.findByTableNameAndClient_Id(tableName, null);
    }

    @Override
    public List<MappingRule> getActiveMappingRules(Long clientId, Pageable pageable) {
        List<MappingRule> rules = mappingRuleRepository.findByClient_IdAndIsActive(clientId, true);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), rules.size());
        return rules.subList(start, end);
    }

    @Override
    public void deleteMappingRulesByClientAndTable(Long clientId, String tableName) {
        mappingRuleRepository.deleteByClient_IdAndTableName(clientId, tableName);
    }
} 
