package com.example.evolvingui.controller;

import com.example.evolvingui.dto.SupplierDTO;
import com.example.evolvingui.exception.SupplierNotFoundException;
import com.example.evolvingui.exception.SupplierValidationException;
import com.example.evolvingui.service.SupplierService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private static final Logger logger = LoggerFactory.getLogger(SupplierController.class);
    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<Page<SupplierDTO>> getAllSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Fetching suppliers with page: {} and size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<SupplierDTO> supplierPage = supplierService.getAllSuppliers(pageable);
        return ResponseEntity.ok(supplierPage);
    }

    @GetMapping("/{id}")
    public SupplierDTO getSupplierById(@PathVariable Long id) {
        if (id <= 0) {
            logger.warn("Invalid supplier ID: {}", id);
            throw new IllegalArgumentException("Supplier ID must be a positive integer");
        }
        logger.info("Fetching supplier with ID: {}", id);
        return supplierService.getSupplierById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierDTO createSupplier(@Valid @RequestBody SupplierDTO supplierDTO) {
        logger.info("Creating new supplier: {}", supplierDTO);
        return supplierService.createSupplier(supplierDTO);
    }

    @PutMapping("/{id}")
    public SupplierDTO updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierDTO supplierDTO) {
        if (id <= 0) {
            logger.warn("Invalid supplier ID: {}", id);
            throw new IllegalArgumentException("Supplier ID must be a positive integer");
        }
        logger.info("Updating supplier with ID: {}", id);
        return supplierService.updateSupplier(id, supplierDTO);
    }

    @PatchMapping("/{id}")
    public SupplierDTO partialUpdateSupplier(@PathVariable Long id, @RequestBody SupplierDTO supplierDTO) {
        if (id <= 0) {
            logger.warn("Invalid supplier ID: {}", id);
            throw new IllegalArgumentException("Supplier ID must be a positive integer");
        }
        logger.info("Partially updating supplier with ID: {}", id);
        return supplierService.partialUpdateSupplier(id, supplierDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSupplier(@PathVariable Long id) {
        if (id <= 0) {
            logger.warn("Invalid supplier ID: {}", id);
            throw new IllegalArgumentException("Supplier ID must be a positive integer");
        }
        logger.info("Deleting supplier with ID: {}", id);
        supplierService.deleteSupplier(id);
    }

    @ExceptionHandler(SupplierNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleSupplierNotFoundException(SupplierNotFoundException ex) {
        logger.error("Supplier not found: {}", ex.getMessage());
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(SupplierValidationException.class)
    public ResponseEntity<Map<String, String>> handleSupplierValidationException(SupplierValidationException ex) {
        logger.error("Validation error: {}", ex.getMessage());
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}