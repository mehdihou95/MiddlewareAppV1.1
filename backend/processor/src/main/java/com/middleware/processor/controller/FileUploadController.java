package com.middleware.processor.controller;

import com.middleware.processor.dto.ProcessedFileDTO;
import com.middleware.processor.mapper.ProcessedFileMapper;
import com.middleware.processor.model.ProcessedFile;
import com.middleware.processor.service.interfaces.XmlProcessorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final XmlProcessorService xmlProcessorService;
    private final ProcessedFileMapper processedFileMapper;

    public FileUploadController(XmlProcessorService xmlProcessorService, ProcessedFileMapper processedFileMapper) {
        this.xmlProcessorService = xmlProcessorService;
        this.processedFileMapper = processedFileMapper;
    }

    @PostMapping("/upload/{interfaceId}")
    public ResponseEntity<ProcessedFileDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable Long interfaceId) {
        ProcessedFile processedFile = xmlProcessorService.processXmlFileAsync(file, interfaceId).join();
        return ResponseEntity.ok(processedFileMapper.toDTO(processedFile));
    }

    @GetMapping("/processed")
    public ResponseEntity<Page<ProcessedFile>> getProcessedFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "processedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(xmlProcessorService.getProcessedFiles(pageRequest));
    }

    @GetMapping("/errors")
    public ResponseEntity<Page<ProcessedFile>> getErrorFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "processedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(xmlProcessorService.getErrorFiles(pageRequest));
    }

    @PostMapping("/reprocess/{fileId}")
    public ResponseEntity<Void> reprocessFile(@PathVariable Long fileId) {
        xmlProcessorService.reprocessFile(fileId);
        return ResponseEntity.ok().build();
    }
} 
