package com.example.evolvingui.repository;

     import com.example.evolvingui.entity.Supplier;
     import org.springframework.data.jpa.repository.JpaRepository;

     public interface SupplierRepository extends JpaRepository<Supplier, Long> {
     }