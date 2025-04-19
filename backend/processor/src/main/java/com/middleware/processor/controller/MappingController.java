package com.middleware.processor.controller;

import com.middleware.processor.model.MappingRule;
import com.middleware.processor.model.Interface;
import com.middleware.processor.model.AsnHeader;
import com.middleware.processor.model.AsnLine;
import com.middleware.processor.service.interfaces.XsdService;
import com.middleware.processor.service.interfaces.InterfaceService;
import com.middleware.processor.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.Column;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/mapping")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MappingController {

    @Autowired
    private XsdService xsdService;

    @Autowired
    private InterfaceService interfaceService;

    private String getFieldType(Field field) {
        Class<?> type = field.getType();
        if (type == String.class) {
            return "string";
        } else if (type == Integer.class || type == Long.class || type == BigDecimal.class) {
            return "number";
        } else if (type == Boolean.class) {
            return "boolean";
        } else if (type == Date.class) {
            return "date";
        }
        return "string"; // default type
    }

    private List<Map<String, Object>> getFieldsFromEntity(Class<?> entityClass, String tableName) {
        List<Map<String, Object>> fields = new ArrayList<>();
        
        for (Field field : entityClass.getDeclaredFields()) {
            Column column = field.getAnnotation(Column.class);
            if (column != null) {
                String fieldName = column.name().isEmpty() ? field.getName() : column.name();
                Map<String, Object> fieldMap = new HashMap<>();
                fieldMap.put("field", tableName + "." + fieldName);
                fieldMap.put("type", getFieldType(field));
                fieldMap.put("table", tableName);
                fieldMap.put("required", !column.nullable());
                fields.add(fieldMap);
            }
        }
        
        return fields;
    }

    @GetMapping("/xsd-structure")
    public ResponseEntity<List<Map<String, Object>>> getXsdStructure(@RequestParam String xsdPath) {
        List<Map<String, Object>> elements = xsdService.getXsdStructure(xsdPath);
        return ResponseEntity.ok(elements);
    }

    @GetMapping("/xsd-structure/{interfaceId}")
    public ResponseEntity<List<Map<String, Object>>> getXsdStructureByInterfaceId(@PathVariable Long interfaceId) {
        // Get the interface from the database
        Interface interfaceEntity = interfaceService.getInterfaceById(interfaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Interface not found with id: " + interfaceId));
        
        // Get the XSD structure using the schema path from the interface
        List<Map<String, Object>> elements = xsdService.getXsdStructure(interfaceEntity.getSchemaPath());
        return ResponseEntity.ok(elements);
    }

    @GetMapping("/rules")
    public ResponseEntity<Page<MappingRule>> getAllMappingRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sortBy));
        return ResponseEntity.ok(xsdService.getAllMappingRules(pageable));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteMappingRule(@PathVariable Long id) {
        xsdService.deleteMappingRule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/database-fields")
    public ResponseEntity<List<Map<String, Object>>> getDatabaseFields(
            @RequestParam Long clientId,
            @RequestParam Long interfaceId) {
        List<Map<String, Object>> fields = new ArrayList<>();
        
        // Get fields from AsnHeader entity
        fields.addAll(getFieldsFromEntity(AsnHeader.class, "ASN_HEADERS"));
        
        // Get fields from AsnLine entity
        fields.addAll(getFieldsFromEntity(AsnLine.class, "ASN_LINES"));
        
        return ResponseEntity.ok(fields);
    }
} 
