package com.example.evolvingui.service;

import com.example.evolvingui.dto.SupplierDTO;
import com.example.evolvingui.entity.Supplier;
import com.example.evolvingui.exception.SupplierNotFoundException;
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
        Supplier supplier = new Supplier();
        supplier.setItem(supplierDTO.getItem());
        supplier.setDeliveryTime(supplierDTO.getDeliveryTime());
        supplier.setRejectionRate(supplierDTO.getRejectionRate());
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDTO(savedSupplier);
    }

    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new SupplierNotFoundException("Supplier with ID " + id + " not found");
        }
        supplierRepository.deleteById(id);
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