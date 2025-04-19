package com.middleware.processor.service.impl;

import com.middleware.processor.service.interfaces.XmlValidationService;
import com.middleware.processor.exception.XmlValidationException;
import com.middleware.processor.model.Interface;
import com.middleware.processor.config.XmlValidationConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.transform.Source;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import java.io.IOException;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class XmlValidationServiceImpl implements XmlValidationService {
    
    private final XmlValidationConfig validationConfig;
    private String validationErrorMessage;

    static {
        // Set system properties before any XML parsing is done
        System.setProperty("jdk.xml.entityExpansionLimit", "0");
        System.setProperty("entityExpansionLimit", "0");
        System.setProperty("jdk.xml.maxOccurLimit", "0");
        System.setProperty("javax.xml.accessExternalDTD", "all");
        System.setProperty("javax.xml.accessExternalSchema", "all");
    }

    public XmlValidationServiceImpl(XmlValidationConfig validationConfig) {
        this.validationConfig = validationConfig;
        // Set system properties using configuration values
        System.setProperty("jdk.xml.entityExpansionLimit", validationConfig.getEntityExpansionLimit());
        System.setProperty("entityExpansionLimit", validationConfig.getEntityExpansionLimit());
        System.setProperty("jdk.xml.maxOccurLimit", validationConfig.getEntityExpansionLimit());
        System.setProperty("javax.xml.accessExternalDTD", validationConfig.isEnableExternalDtd() ? "all" : "");
        System.setProperty("javax.xml.accessExternalSchema", validationConfig.isEnableExternalSchema() ? "all" : "");
    }

    @Override
    public boolean validateXmlAgainstXsd(Document document, String xsdContent) {
        try {
            log.trace("Starting XML validation against XSD");
            log.trace("XML document root element: {}", document.getDocumentElement().getNodeName());
            log.trace("XSD content length: {}", xsdContent.length());
            
            // Create and configure the schema factory with configuration settings
            System.setProperty("jdk.xml.entityExpansionLimit", validationConfig.getEntityExpansionLimit());
            SchemaFactory factory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            log.trace("Created SchemaFactory instance");
            
            // Try all known property combinations for entity expansion limit
            try {
                factory.setProperty("http://www.oracle.com/xml/jaxp/properties/entityExpansionLimit", 
                                  validationConfig.getEntityExpansionLimit());
                log.trace("Set Oracle entity expansion limit to: {}", validationConfig.getEntityExpansionLimit());
            } catch (SAXException e) {
                log.debug("Could not set Oracle entity expansion limit", e);
            }
            
            try {
                factory.setProperty("entityExpansionLimit", validationConfig.getEntityExpansionLimit());
                log.trace("Set direct entity expansion limit to: {}", validationConfig.getEntityExpansionLimit());
            } catch (SAXException e) {
                log.debug("Could not set direct entity expansion limit", e);
            }

            // Configure security settings from config
            factory.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, 
                              validationConfig.isEnableExternalDtd() ? "all" : "");
            factory.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, 
                              validationConfig.isEnableExternalSchema() ? "all" : "");
            log.trace("Configured security settings - DTD: {}, Schema: {}", 
                     validationConfig.isEnableExternalDtd(), 
                     validationConfig.isEnableExternalSchema());
            
            // Set features from config
            factory.setFeature("http://apache.org/xml/features/honour-all-schemaLocations", 
                             validationConfig.isHonourAllSchemaLocations());
            factory.setFeature("http://apache.org/xml/features/validation/schema-full-checking", 
                             validationConfig.isEnableSchemaFullChecking());
            log.trace("Set XML features - honour-all-schemaLocations: {}, schema-full-checking: {}", 
                     validationConfig.isHonourAllSchemaLocations(), 
                     validationConfig.isEnableSchemaFullChecking());
            
            Source schemaSource = new StreamSource(new StringReader(xsdContent));
            log.trace("Created schema source from XSD content");
            
            Schema schema = factory.newSchema(schemaSource);
            log.trace("Created schema from source");
            
            Validator validator = schema.newValidator();
            log.trace("Created validator from schema");
            
            // Configure validator with same settings from config
            validator.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, 
                                validationConfig.isEnableExternalDtd() ? "all" : "");
            validator.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, 
                                validationConfig.isEnableExternalSchema() ? "all" : "");
            log.trace("Configured validator security settings");
            
            try {
                validator.setProperty("http://www.oracle.com/xml/jaxp/properties/entityExpansionLimit", 
                                    validationConfig.getEntityExpansionLimit());
                log.trace("Set validator entity expansion limit");
            } catch (SAXException e) {
                log.debug("Could not set Oracle entity expansion limit on validator", e);
            }
            
            validator.setFeature("http://apache.org/xml/features/validation/schema-full-checking", 
                               validationConfig.isEnableSchemaFullChecking());
            log.trace("Set validator schema full checking feature");
            
            // Add debug logging
            log.debug("Starting validation with entity expansion limit: {}", 
                     validationConfig.getEntityExpansionLimit());
            validator.validate(new DOMSource(document));
            log.trace("Validation completed successfully");
            
            validationErrorMessage = null;
            return true;
        } catch (SAXException e) {
            validationErrorMessage = "XML validation failed against XSD: " + e.getMessage();
            log.error(validationErrorMessage, e);
            log.error("Validation stack trace:", e);
            return false;
        } catch (IOException e) {
            validationErrorMessage = "Error reading XSD schema: " + e.getMessage();
            log.error(validationErrorMessage, e);
            return false;
        }
    }

    @Override
    public boolean validateXmlStructure(Document document) {
        try {
            Element root = document.getDocumentElement();
            if (root == null) {
                validationErrorMessage = "XML document has no root element";
                return false;
            }

            validationErrorMessage = null;
            return true;
        } catch (Exception e) {
            validationErrorMessage = "XML structure validation failed: " + e.getMessage();
            log.error(validationErrorMessage, e);
            return false;
        }
    }

    @Override
    public boolean validateXmlContent(Document document, Interface interfaceEntity) {
        try {
            Path xsdPath = Paths.get(interfaceEntity.getSchemaPath());

            if (!Files.exists(xsdPath)) {
                // Try as a classpath resource
                try {
                    String resourcePath = interfaceEntity.getSchemaPath().replace("backend/src/main/resources/", "");
                    xsdPath = Paths.get(getClass().getClassLoader().getResource(resourcePath).toURI());
                } catch (Exception e) {
                    validationErrorMessage = "XSD schema not found at path: " + xsdPath;
                    log.error(validationErrorMessage);
                    return false;
                }
            }

            String xsdContent = Files.readString(xsdPath);
            return validateXmlAgainstXsd(document, xsdContent);
        } catch (IOException e) {
            validationErrorMessage = "Error reading XSD file: " + e.getMessage();
            log.error(validationErrorMessage, e);
            return false;
        }
    }

    @Override
    public boolean validateXmlContent(Document document, String interfaceType) {
        throw new UnsupportedOperationException("This method is deprecated. Please use validateXmlContent(Document, Interface) instead.");
    }

    @Override
    public String getValidationErrorMessage() {
        return validationErrorMessage;
    }

    @Override
    public void validateXmlContent(String xmlContent, String interfaceType) throws XmlValidationException {
        throw new UnsupportedOperationException("This method is deprecated. Please use validateXmlContent with Interface entity instead.");
    }
} 
