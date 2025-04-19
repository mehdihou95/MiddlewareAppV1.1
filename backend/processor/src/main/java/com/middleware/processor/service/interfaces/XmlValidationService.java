package com.middleware.processor.service.interfaces;

import org.w3c.dom.Document;
import com.middleware.processor.model.Interface;

/**
 * Service interface for XML validation operations.
 */
public interface XmlValidationService {
    /**
     * Validates an XML document against an XSD schema.
     */
    boolean validateXmlAgainstXsd(Document document, String xsdContent);

    /**
     * Validates the structure of an XML document.
     */
    boolean validateXmlStructure(Document document);

    /**
     * Validates the content of an XML document against business rules.
     * @deprecated Use {@link #validateXmlContent(Document, Interface)} instead
     */
    @Deprecated
    boolean validateXmlContent(Document document, String interfaceType);

    /**
     * Validates the content of an XML document against the interface's XSD schema.
     * @param document The XML document to validate
     * @param interfaceEntity The interface containing the schema path
     * @return true if validation succeeds, false otherwise
     */
    boolean validateXmlContent(Document document, Interface interfaceEntity);

    /**
     * Gets the validation error message from the last validation operation.
     */
    String getValidationErrorMessage();

    /**
     * Validates XML content provided as a string.
     * 
     * @param xmlContent The XML content as a string
     * @param interfaceType The type of interface to validate against
     * @throws Exception if validation fails
     */
    void validateXmlContent(String xmlContent, String interfaceType) throws Exception;
} 
