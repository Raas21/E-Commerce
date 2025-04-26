package com.example.evolvingui.service;

import com.example.evolvingui.dto.SupplierDTO;
import com.example.evolvingui.entity.Supplier;
import com.example.evolvingui.exception.SupplierNotFoundException;
import com.example.evolvingui.exception.SupplierValidationException;
import com.example.evolvingui.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<SupplierDTO> getAllSuppliers() {
        List<Supplier> suppliers = supplierRepository.findAll();
        return suppliers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier with ID " + id + " not found"));
        return convertToDTO(supplier);
    }

    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        validateSupplier(supplierDTO);
        Supplier supplier = new Supplier();
        supplier.setItem(supplierDTO.getItem());
        supplier.setDeliveryTime(supplierDTO.getDeliveryTime());
        supplier.setRejectionRate(supplierDTO.getRejectionRate());
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDTO(savedSupplier);
    }

    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier with ID " + id + " not found"));
        validateSupplier(supplierDTO);
        supplier.setItem(supplierDTO.getItem());
        supplier.setDeliveryTime(supplierDTO.getDeliveryTime());
        supplier.setRejectionRate(supplierDTO.getRejectionRate());
        Supplier updatedSupplier = supplierRepository.save(supplier);
        return convertToDTO(updatedSupplier);
    }

    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new SupplierNotFoundException("Supplier with ID " + id + " not found");
        }
        supplierRepository.deleteById(id);
    }

    private void validateSupplier(SupplierDTO supplierDTO) {
        if (supplierDTO.getItem() == null || supplierDTO.getItem().trim().isEmpty()) {
            throw new SupplierValidationException("Item cannot be empty");
        }
        if (supplierDTO.getDeliveryTime() == null || supplierDTO.getDeliveryTime() <= 0) {
            throw new SupplierValidationException("Delivery time must be a positive integer");
        }
        if (supplierDTO.getRejectionRate() != null && (supplierDTO.getRejectionRate() < 0 || supplierDTO.getRejectionRate() > 1)) {
            throw new SupplierValidationException("Rejection rate must be between 0 and 1");
        }
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setItem(supplier.getItem());
        dto.setDeliveryTime(supplier.getDeliveryTime());
        dto.setRejectionRate(supplier.getRejectionRate());
        return dto;
    }
}