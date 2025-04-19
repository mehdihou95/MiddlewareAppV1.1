package com.middleware.processor.service.strategy;

import com.middleware.processor.exception.ValidationException;
import com.middleware.processor.model.Interface;
import com.middleware.processor.model.ProcessedFile;
import com.middleware.processor.model.MappingRule;
import com.middleware.processor.repository.MappingRuleRepository;
import com.middleware.processor.service.interfaces.ProcessedFileService;
import com.middleware.processor.service.interfaces.XmlValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Strategy implementation for processing XML documents.
 */
@Component
public class XmlProcessingStrategy implements DocumentProcessingStrategy {

    @Autowired
    private ProcessedFileService processedFileService;

    @Autowired
    private XmlValidationService xmlValidationService;

    @Autowired
    private MappingRuleRepository mappingRuleRepository;

    private final XPath xPath;

    public XmlProcessingStrategy() {
        this.xPath = XPathFactory.newInstance().newXPath();
    }

    @Override
    public ProcessedFile processDocument(MultipartFile file, Interface interfaceEntity) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(file.getInputStream());

            // Create a new ProcessedFile record
            ProcessedFile processedFile = new ProcessedFile();
            processedFile.setFileName(file.getOriginalFilename());
            processedFile.setStatus("PROCESSING");
            processedFile.setInterfaceEntity(interfaceEntity);
            processedFile.setClient(interfaceEntity.getClient());
            processedFile.setProcessedAt(LocalDateTime.now());
            processedFile = processedFileService.createProcessedFile(processedFile);

            if (!xmlValidationService.validateXmlStructure(document)) {
                processedFile.setStatus("ERROR");
                processedFile.setErrorMessage(xmlValidationService.getValidationErrorMessage());
                return processedFileService.updateProcessedFile(processedFile.getId(), processedFile);
            }

            if (!xmlValidationService.validateXmlContent(document, interfaceEntity)) {
                processedFile.setStatus("ERROR");
                processedFile.setErrorMessage(xmlValidationService.getValidationErrorMessage());
                return processedFileService.updateProcessedFile(processedFile.getId(), processedFile);
            }

            String transformedXml = transformXmlFile(file, interfaceEntity);
            processedFile.setStatus("SUCCESS");
            processedFile.setContent(transformedXml);

            return processedFileService.updateProcessedFile(processedFile.getId(), processedFile);
        } catch (Exception e) {
            // Create error record if we haven't created one yet
            ProcessedFile processedFile = new ProcessedFile();
            processedFile.setFileName(file.getOriginalFilename());
            processedFile.setStatus("ERROR");
            processedFile.setInterfaceEntity(interfaceEntity);
            processedFile.setClient(interfaceEntity.getClient());
            processedFile.setProcessedAt(LocalDateTime.now());
            processedFile.setErrorMessage("Failed to process XML file: " + e.getMessage());
            return processedFileService.createProcessedFile(processedFile);
        }
    }

    @Override
    public ProcessedFile processDocument(Document document, Interface interfaceEntity, Long clientId) {
        try {
            // Find existing record or create new one if not found
            ProcessedFile processedFile = processedFileService.findByFileNameAndInterfaceId(
                "document.xml", 
                interfaceEntity.getId()
            ).orElseGet(() -> {
                ProcessedFile newFile = new ProcessedFile();
                newFile.setFileName("document.xml");
                newFile.setInterfaceEntity(interfaceEntity);
                newFile.setProcessedAt(LocalDateTime.now());
                return newFile;
            });

            if (!xmlValidationService.validateXmlStructure(document)) {
                processedFile.setStatus("ERROR");
                processedFile.setErrorMessage(xmlValidationService.getValidationErrorMessage());
                return processedFileService.updateProcessedFile(processedFile.getId(), processedFile);
            }

            if (!xmlValidationService.validateXmlContent(document, interfaceEntity)) {
                processedFile.setStatus("ERROR");
                processedFile.setErrorMessage(xmlValidationService.getValidationErrorMessage());
                return processedFileService.updateProcessedFile(processedFile.getId(), processedFile);
            }

            processedFile.setStatus("SUCCESS");
            return processedFileService.updateProcessedFile(processedFile.getId(), processedFile);
        } catch (Exception e) {
            ProcessedFile processedFile = processedFileService.findByFileNameAndInterfaceId(
                "document.xml", 
                interfaceEntity.getId()
            ).orElseGet(() -> {
                ProcessedFile newFile = new ProcessedFile();
                newFile.setFileName("document.xml");
                newFile.setInterfaceEntity(interfaceEntity);
                newFile.setProcessedAt(LocalDateTime.now());
                return newFile;
            });
            
            processedFile.setStatus("ERROR");
            processedFile.setErrorMessage(e.getMessage());
            return processedFileService.updateProcessedFile(processedFile.getId(), processedFile);
        }
    }

    private String transformXmlFile(MultipartFile file, Interface interfaceEntity) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(file.getInputStream());

            // Get mapping rules for the interface
            List<MappingRule> mappingRules = mappingRuleRepository.findByInterfaceIdAndIsActiveTrue(interfaceEntity.getId());
            
            // Apply mapping rules to transform the XML
            for (MappingRule rule : mappingRules) {
                String xmlPath = rule.getXmlPath();
                String targetField = rule.getTargetField();
                String transformation = rule.getTransformation();
                
                // Find the source element using XPath
                NodeList sourceNodes = (NodeList) xPath.evaluate(xmlPath, document, XPathConstants.NODESET);
                if (sourceNodes != null && sourceNodes.getLength() > 0) {
                    for (int i = 0; i < sourceNodes.getLength(); i++) {
                        Node sourceNode = sourceNodes.item(i);
                        String value = sourceNode.getTextContent();
                        
                        // Apply transformation if specified
                        if (transformation != null && !transformation.isEmpty()) {
                            value = applyTransformation(value, transformation);
                        }
                        
                        // Create or update target element
                        Element targetElement = findOrCreateElement(document, targetField);
                        targetElement.setTextContent(value);
                    }
                }
            }

            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            DOMSource source = new DOMSource(document);
            StringWriter writer = new StringWriter();
            StreamResult result = new StreamResult(writer);
            transformer.transform(source, result);
            return writer.toString();
        } catch (Exception e) {
            throw new ValidationException("Failed to transform XML file", e);
        }
    }

    private Element findOrCreateElement(Document document, String path) {
        String[] parts = path.split("/");
        Element current = document.getDocumentElement();
        
        for (String part : parts) {
            NodeList children = current.getElementsByTagName(part);
            if (children.getLength() > 0) {
                current = (Element) children.item(0);
            } else {
                Element newElement = document.createElement(part);
                current.appendChild(newElement);
                current = newElement;
            }
        }
        
        return current;
    }

    private String applyTransformation(String value, String transformation) {
        // Apply basic transformations
        switch (transformation.toLowerCase()) {
            case "uppercase":
                return value.toUpperCase();
            case "lowercase":
                return value.toLowerCase();
            case "trim":
                return value.trim();
            case "date":
                try {
                    // Handle common date formats
                    if (value.matches("\\d{4}-\\d{2}-\\d{2}")) {
                        return value; // Already in ISO format
                    } else if (value.matches("\\d{2}/\\d{2}/\\d{4}")) {
                        String[] parts = value.split("/");
                        return parts[2] + "-" + parts[0] + "-" + parts[1];
                    } else if (value.matches("\\d{2}-\\d{2}-\\d{4}")) {
                        String[] parts = value.split("-");
                        return parts[2] + "-" + parts[0] + "-" + parts[1];
                    }
                    return value; // Return original if format not recognized
                } catch (Exception e) {
                    return value; // Return original if transformation fails
                }
            case "number":
                try {
                    // Remove currency symbols and commas
                    String cleanValue = value.replaceAll("[^\\d.-]", "");
                    // Convert to double and format with 2 decimal places
                    double number = Double.parseDouble(cleanValue);
                    return String.format("%.2f", number);
                } catch (Exception e) {
                    return value; // Return original if transformation fails
                }
            default:
                return value;
        }
    }

    @Override
    public String getDocumentType() {
        return "XML";
    }

    @Override
    public boolean canHandle(String documentType) {
        return "XML".equalsIgnoreCase(documentType);
    }

    @Override
    public String getName() {
        return "XML Document Processor";
    }

    @Override
    public int getPriority() {
        return 50; // Medium priority for XML documents
    }
} 
