package com.example.evolvingui.service;

import com.example.evolvingui.dto.SupplierDTO;
import com.example.evolvingui.entity.Supplier;
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

    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setItem(supplier.getItem());
        dto.setDeliveryTime(supplier.getDeliveryTime());
        dto.setRejectionRate(supplier.getRejectionRate());
        return dto;
    }
}