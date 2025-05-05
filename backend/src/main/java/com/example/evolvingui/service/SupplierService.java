package com.example.evolvingui.service;

import com.example.evolvingui.dto.SupplierDTO;
import com.example.evolvingui.exception.SupplierNotFoundException;
import com.example.evolvingui.exception.SupplierValidationException;
import com.example.evolvingui.entity.Supplier;
import com.example.evolvingui.repository.SupplierRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private static final Logger logger = LoggerFactory.getLogger(SupplierService.class);
    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public Page<SupplierDTO> getAllSuppliers(Pageable pageable) {
        logger.info("Fetching all suppliers with pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        return supplierRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public SupplierDTO getSupplierById(Long id) {
        logger.info("Fetching supplier with ID: {}", id);
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID: " + id));
        return convertToDTO(supplier);
    }

    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        validateSupplierDTO(supplierDTO);
        logger.info("Creating supplier: {}", supplierDTO);
        Supplier supplier = convertToEntity(supplierDTO);
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDTO(savedSupplier);
    }

    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        validateSupplierDTO(supplierDTO);
        logger.info("Updating supplier with ID: {}", id);
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID: " + id));
        existingSupplier.setItem(supplierDTO.getItem());
        existingSupplier.setDeliveryTime(supplierDTO.getDeliveryTime());
        existingSupplier.setRejectionRate(supplierDTO.getRejectionRate());
        Supplier updatedSupplier = supplierRepository.save(existingSupplier);
        return convertToDTO(updatedSupplier);
    }

    public SupplierDTO partialUpdateSupplier(Long id, SupplierDTO supplierDTO) {
        logger.info("Partially updating supplier with ID: {}", id);
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID: " + id));

        if (supplierDTO.getItem() != null) {
            existingSupplier.setItem(supplierDTO.getItem());
        }
        if (supplierDTO.getDeliveryTime() != null) {
            existingSupplier.setDeliveryTime(supplierDTO.getDeliveryTime());
        }
        if (supplierDTO.getRejectionRate() != null) {
            existingSupplier.setRejectionRate(supplierDTO.getRejectionRate());
        }

        Supplier updatedSupplier = supplierRepository.save(existingSupplier);
        return convertToDTO(updatedSupplier);
    }

    public void deleteSupplier(Long id) {
        logger.info("Deleting supplier with ID: {}", id);
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID: " + id));
        supplierRepository.delete(supplier);
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setItem(supplier.getItem());
        dto.setDeliveryTime(supplier.getDeliveryTime());
        dto.setRejectionRate(supplier.getRejectionRate());
        return dto;
    }

    private Supplier convertToEntity(SupplierDTO dto) {
        Supplier supplier = new Supplier();
        supplier.setId(dto.getId());
        supplier.setItem(dto.getItem());
        supplier.setDeliveryTime(dto.getDeliveryTime());
        supplier.setRejectionRate(dto.getRejectionRate());
        return supplier;
    }

    private void validateSupplierDTO(SupplierDTO supplierDTO) {
        if (supplierDTO.getItem() == null || supplierDTO.getItem().trim().isEmpty()) {
            throw new SupplierValidationException("Item cannot be empty");
        }
        if (supplierDTO.getDeliveryTime() == null || supplierDTO.getDeliveryTime() <= 0) {
            throw new SupplierValidationException("Delivery time must be a positive integer");
        }
        if (supplierDTO.getRejectionRate() == null || supplierDTO.getRejectionRate() < 0 || supplierDTO.getRejectionRate() > 1) {
            throw new SupplierValidationException("Rejection rate must be between 0 and 1");
        }
    }
}