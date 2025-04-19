package com.middleware.processor.service.strategy;

import com.middleware.processor.model.*;
import com.middleware.processor.service.interfaces.AsnService;
import com.middleware.processor.service.interfaces.MappingRuleService;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.Map;
import com.middleware.processor.service.interfaces.ProcessedFileService;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.lang.StringBuilder;

@Component
public class AsnDocumentProcessingStrategy extends AbstractDocumentProcessingStrategy {
    
    private static final Logger logger = LoggerFactory.getLogger(AsnDocumentProcessingStrategy.class);
    private static final String ASN_TYPE = "ASN";
    
    // ASN-specific date formats
    private static final SimpleDateFormat ASN_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");
    private static final SimpleDateFormat ASN_TIME_FORMAT = new SimpleDateFormat("HH:mm:ss");
    private static final SimpleDateFormat OUTPUT_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");
    private static final SimpleDateFormat OUTPUT_TIME_FORMAT = new SimpleDateFormat("HH:mm:ss");
    
    @Autowired
    private AsnService asnService;
    
    @Autowired
    private MappingRuleService mappingRuleService;
    
    @Autowired
    private ProcessedFileService processedFileService;
    
    @Override
    public String getDocumentType() {
        return ASN_TYPE;
    }
    
    @Override
    public boolean canHandle(String interfaceType) {
        return ASN_TYPE.equalsIgnoreCase(interfaceType);
    }
    
    @Override
    public String getName() {
        return "ASN Document Processor";
    }

    @Override
    @Transactional
    public ProcessedFile processDocument(MultipartFile file, Interface interfaceEntity) {
        try {
            // Get the existing ProcessedFile record from the service
            ProcessedFile processedFile = processedFileService.findMostRecentByFileNameAndInterfaceId(
                file.getOriginalFilename(), 
                interfaceEntity.getId()
            ).orElseGet(() -> {
                ProcessedFile newFile = new ProcessedFile();
                newFile.setFileName(file.getOriginalFilename());
                newFile.setStatus("PROCESSING");
                newFile.setInterfaceEntity(interfaceEntity);
                newFile.setClient(interfaceEntity.getClient());
                newFile.setProcessedAt(LocalDateTime.now());
                return processedFileService.createProcessedFile(newFile);
            });
            
            StringBuilder errorMessages = new StringBuilder();
            boolean hasFieldMappingErrors = false;
            
            try {
                Document document = parseXmlFile(file);
                
                // Store normalized XML content
                String normalizedContent = normalizeXmlContent(document);
                processedFile.setContent(normalizedContent);
                
                XPath xPath = XPathFactory.newInstance().newXPath();
                
                // Get active mapping rules
                List<MappingRule> headerRules = mappingRuleService.findByTableNameAndClient_Id("ASN_HEADERS", interfaceEntity.getClient().getId(), PageRequest.of(0, 100)).getContent();
                List<MappingRule> lineRules = mappingRuleService.findByTableNameAndClient_Id("ASN_LINES", interfaceEntity.getClient().getId(), PageRequest.of(0, 100)).getContent();
                
                // Create header
                AsnHeader header = new AsnHeader();
                header.setClient(interfaceEntity.getClient());
                header.setHasImportError(false);
                header.setHasSoftCheckError(false);
                header.setHasAlerts(false);
                header.setIsCogiGenerated(false);
                header.setIsCancelled(false);
                header.setIsClosed(false);
                header.setIsGift(false);
                header.setIsWhseTransfer("0");
                header.setAsnLevel(1); // Default level
                header.setReceiptDttm(OUTPUT_DATE_FORMAT.format(new Date()));
                header.setQualityAuditPercent(BigDecimal.ZERO);
                header.setAsnPriority(0);
                header.setScheduleAppt(0);
                header.setCreatedSourceType(0);
                header.setLastUpdatedSourceType(0);
                
                // Apply header mapping rules
                for (MappingRule rule : headerRules) {
                    if (rule.getIsActive()) {
                        try {
                            String value = getNodeValue(xPath, rule.getXmlPath(), document);
                            if (value != null) {
                                setFieldValue(header, rule, value);
                            }
                        } catch (Exception e) {
                            logger.error("Error applying header mapping rule {}: {}", rule.getXmlPath(), e.getMessage());
                            hasFieldMappingErrors = true;
                            errorMessages.append("Header mapping error for ").append(rule.getXmlPath())
                                .append(": ").append(e.getMessage()).append("; ");
                        }
                    }
                }
                
                AsnHeader savedHeader = asnService.createAsnHeader(header);
                List<AsnLine> lines = new ArrayList<>();
                
                // Group line rules by their parent paths to handle multiple line types
                Map<String, List<MappingRule>> lineRulesByParent = lineRules.stream()
                    .filter(MappingRule::getIsActive)
                    .collect(Collectors.groupingBy(rule -> getParentPath(rule.getXmlPath())));
                
                // Process each group of line rules
                Set<Node> processedNodes = new HashSet<>();  // Track processed nodes
                for (Map.Entry<String, List<MappingRule>> entry : lineRulesByParent.entrySet()) {
                    String parentPath = entry.getKey();
                    List<MappingRule> rulesForPath = entry.getValue();
                    
                    logger.debug("Processing line rules for parent path: {}", parentPath);
                    NodeList lineNodes = (NodeList) xPath.evaluate(parentPath, document, XPathConstants.NODESET);
                    logger.debug("Found {} line nodes to process", lineNodes.getLength());
                    
                    for (int i = 0; i < lineNodes.getLength(); i++) {
                        Node lineContext = lineNodes.item(i);
                        
                        // Skip if we've already processed this node
                        if (processedNodes.contains(lineContext)) {
                            logger.debug("Skipping already processed node {}", i + 1);
                            continue;
                        }
                        processedNodes.add(lineContext);
                        
                        AsnLine line = new AsnLine();
                        line.setHeader(savedHeader);
                        line.setClient(interfaceEntity.getClient());
                        line.setStatus("NEW");
                        boolean hasLineError = false;
                        
                        logger.debug("Processing line node {}", i + 1);
                        for (MappingRule rule : rulesForPath) {
                            try {
                                String relativePath = getRelativePath(rule.getXmlPath());
                                String value = getNodeValue(xPath, relativePath, lineContext);
                                
                                if (value != null) {
                                    setFieldValue(line, rule, value);
                                }
                            } catch (Exception e) {
                                logger.error("Error applying line mapping rule {} for field {}: {}", 
                                    rule.getXmlPath(), rule.getDatabaseField(), e.getMessage());
                                hasFieldMappingErrors = true;
                                hasLineError = true;
                                errorMessages.append("Line ").append(i + 1).append(" mapping error for ")
                                    .append(rule.getXmlPath()).append(": ").append(e.getMessage()).append("; ");
                                break;
                            }
                        }
                        if (!hasLineError) {
                            lines.add(line);
                        }
                    }
                }
                
                // Save all lines
                if (!lines.isEmpty()) {
                    asnService.createAsnLines(lines);
                }

                // Set final status based on mapping errors
                if (hasFieldMappingErrors) {
                    processedFile.setStatus("ERROR");
                    String errorMessage = errorMessages.toString();
                    if (errorMessage.length() > 1000) {
                        errorMessage = errorMessage.substring(0, 997) + "...";
                    }
                    processedFile.setErrorMessage(errorMessage);
                } else {
                    processedFile.setStatus("SUCCESS");
                }
                
                return processedFile;
                
            } catch (Exception e) {
                logger.error("Error processing ASN document: ", e);
                processedFile.setStatus("ERROR");
                String errorMessage = "Failed to process ASN document: " + e.getMessage();
                if (errorMessage.length() > 1000) {
                    errorMessage = errorMessage.substring(0, 997) + "...";
                }
                processedFile.setErrorMessage(errorMessage);
                return processedFile;
            }
        } catch (Exception e) {
            logger.error("Critical error in ASN document processing: ", e);
            ProcessedFile processedFile = new ProcessedFile();
            processedFile.setFileName(file.getOriginalFilename());
            processedFile.setStatus("ERROR");
            processedFile.setInterfaceEntity(interfaceEntity);
            processedFile.setClient(interfaceEntity.getClient());
            processedFile.setProcessedAt(LocalDateTime.now());
            processedFile.setErrorMessage("Critical error in ASN document processing: " + e.getMessage());
            return processedFileService.createProcessedFile(processedFile);
        }
    }
    
    private String getNodeValue(XPath xPath, String xpath, Node contextNode) throws Exception {
        Node node = (Node) xPath.evaluate(xpath, contextNode, XPathConstants.NODE);
        return node != null ? node.getTextContent() : null;
    }

    private String getNodeValue(XPath xPath, String xpath, Document document) throws Exception {
        Node node = (Node) xPath.evaluate(xpath, document, XPathConstants.NODE);
        return node != null ? node.getTextContent() : null;
    }

    private String getParentPath(String xpath) {
        int lastSlash = xpath.lastIndexOf('/');
        return lastSlash > 0 ? xpath.substring(0, lastSlash) : xpath;
    }

    private String getRelativePath(String fullPath) {
        String[] parts = fullPath.split("/");
        return parts[parts.length - 1];
    }
    
    private Document parseXmlFile(MultipartFile file) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(file.getInputStream());
    }
    
    private String normalizeXmlContent(Document document) throws Exception {
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        
        // Configure the transformer for single line output
        transformer.setOutputProperty(OutputKeys.INDENT, "no");
        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "0");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        
        // Transform the document to string
        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(document), new StreamResult(writer));
        
        // Additional normalization to ensure single line
        return writer.toString()
            .replaceAll(">[\\s\\r\\n]+<", "><")  // Remove whitespace between tags
            .replaceAll("\\s+", " ")             // Replace multiple spaces with single space
            .replaceAll("\\n|\\r", "")           // Remove all newlines and carriage returns
            .trim();                             // Remove leading/trailing whitespace
    }
    
    @Override
    protected String applyTransformation(String value, String transformation) {
        if (value == null || value.trim().isEmpty()) {
            return value;
        }
        
        try {
            switch (transformation.toLowerCase()) {
                case "date_format":
                    // Convert date format (YYYY-MM-DD) to standard format (YYYY-MM-DD)
                    return OUTPUT_DATE_FORMAT.format(ASN_DATE_FORMAT.parse(value));
                    
                case "time_format":
                    // Convert time format (HH:MM:SS) to standard format (HH:MM:SS)
                    return OUTPUT_TIME_FORMAT.format(ASN_TIME_FORMAT.parse(value));
                    
                case "remove_leading_zeros":
                    // Remove leading zeros from numeric values
                    return String.valueOf(Long.parseLong(value));
                    
                case "decimal_format":
                    // Format decimal number with 3 decimal places
                    double quantity = Double.parseDouble(value);
                    return String.format("%.3f", quantity);
                    
                case "status_code":
                    // Map status codes to readable values
                    switch (value.trim()) {
                        case "01": return "NEW";
                        case "02": return "PROCESSING";
                        case "03": return "COMPLETED";
                        case "04": return "ERROR";
                        default: return value;
                    }
                    
                default:
                    // Fall back to parent class transformation
                    return super.applyTransformation(value, transformation);
            }
        } catch (ParseException e) {
            logger.error("Error parsing date/time value: {}", value, e);
            return value;
        } catch (NumberFormatException e) {
            logger.error("Error parsing number value: {}", value, e);
            return value;
        } catch (Exception e) {
            logger.error("Error applying transformation {} to value {}: {}", transformation, value, e.getMessage());
            return value;
        }
    }
    
    @Override
    public int getPriority() {
        return 100; // Higher priority for ASN documents
    }

    private String toCamelCase(String fieldName) {
        return Arrays.stream(fieldName.split("_"))
            .map(word -> {
                if (word.isEmpty()) return "";
                return word.equals(fieldName.split("_")[0]) ? word.toLowerCase() : 
                    word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
            })
            .collect(Collectors.joining());
    }

    private <T> void setFieldValue(T entity, MappingRule rule, String value) throws Exception {
        String fieldName = rule.getDatabaseField();
        String camelCaseField = toCamelCase(fieldName);
        String setterName = "set" + camelCaseField.substring(0, 1).toUpperCase() + camelCaseField.substring(1);
        
        // Log the conversion for debugging
        logger.debug("Converting field name '{}' to setter method '{}' (camelCase field: {})", 
            fieldName, setterName, camelCaseField);

        // Apply transformations if needed
        if (rule.getTransformationRule() != null && !rule.getTransformationRule().isEmpty()) {
            value = applyTransformationRule(value, rule.getTransformationRule());
        }

        // Handle different data types dynamically
        Class<?> entityClass = entity.getClass();
        String dataType = rule.getDataType() != null ? rule.getDataType().toLowerCase() : "string";
        
        try {
            Method setter;
            Object convertedValue;
            
            switch (dataType) {
                case "number":
                case "integer":
                    setter = entityClass.getMethod(setterName, Integer.class);
                    // Handle European number format for integers
                    String cleanValue = value.replace(".", "").replace(",", ".");
                    convertedValue = Integer.valueOf((int) Math.round(Double.parseDouble(cleanValue)));
                    break;
                    
                case "decimal":
                case "double":
                    setter = entityClass.getMethod(setterName, Double.class);
                    // Handle European number format for decimals
                    cleanValue = value.replace(".", "").replace(",", ".");
                    convertedValue = Double.valueOf(cleanValue);
                    break;
                    
                case "boolean":
                    setter = entityClass.getMethod(setterName, Boolean.class);
                    convertedValue = Boolean.valueOf(value);
                    break;
                    
                case "date":
                    setter = entityClass.getMethod(setterName, String.class);
                    convertedValue = value; // Assuming date is handled by transformation
                    break;
                    
                default: // string
                    setter = entityClass.getMethod(setterName, String.class);
                    convertedValue = value;
            }
            
            setter.invoke(entity, convertedValue);
            
        } catch (NoSuchMethodException e) {
            // Try with primitive types if object type fails
            try {
                Method setter;
                Object convertedValue;
                
                switch (dataType) {
                    case "number":
                    case "integer":
                        setter = entityClass.getMethod(setterName, int.class);
                        // Handle European number format for integers
                        String cleanValue = value.replace(".", "").replace(",", ".");
                        convertedValue = (int) Math.round(Double.parseDouble(cleanValue));
                        break;
                        
                    case "decimal":
                    case "double":
                        setter = entityClass.getMethod(setterName, double.class);
                        // Handle European number format for decimals
                        cleanValue = value.replace(".", "").replace(",", ".");
                        convertedValue = Double.parseDouble(cleanValue);
                        break;
                        
                    case "boolean":
                        setter = entityClass.getMethod(setterName, boolean.class);
                        convertedValue = Boolean.parseBoolean(value);
                        break;
                        
                    default:
                        throw e; // Rethrow if not a primitive type issue
                }
                
                setter.invoke(entity, convertedValue);
                
            } catch (Exception ex) {
                logger.error("Error setting field {} with value {}: {}", fieldName, value, ex.getMessage());
                throw new RuntimeException("Failed to set field " + fieldName + ": " + ex.getMessage(), ex);
            }
        }
    }

    private String applyTransformationRule(String value, String transformationRule) {
        if (value == null || value.trim().isEmpty()) {
            return value;
        }
        
        try {
            switch (transformationRule.toLowerCase()) {
                case "parse_integer":
                case "remove_leading_zeros":
                    // Remove leading zeros and convert to integer
                    return String.valueOf(Long.parseLong(value.trim()));
                    
                case "format_date":
                    // Format date to standard format
                    return OUTPUT_DATE_FORMAT.format(ASN_DATE_FORMAT.parse(value));
                    
                case "format_time":
                    // Format time to standard format
                    return OUTPUT_TIME_FORMAT.format(ASN_TIME_FORMAT.parse(value));
                    
                case "format_decimal":
                    // Format decimal with precision
                    double number = Double.parseDouble(value);
                    return String.format("%.3f", number);
                    
                case "map_status":
                    // Map status codes to values
                    switch (value.trim()) {
                        case "01": return "NEW";
                        case "02": return "PROCESSING";
                        case "03": return "COMPLETED";
                        case "04": return "ERROR";
                        default: return value;
                    }
                    
                default:
                    logger.warn("Unknown transformation rule: {}", transformationRule);
                    return value;
            }
        } catch (ParseException e) {
            logger.error("Error parsing date/time value: {}", value, e);
            return value;
        } catch (NumberFormatException e) {
            logger.error("Error parsing number value: {}", value, e);
            return value;
        } catch (Exception e) {
            logger.error("Error applying transformation rule {} to value {}: {}", transformationRule, value, e.getMessage());
            return value;
        }
    }
}