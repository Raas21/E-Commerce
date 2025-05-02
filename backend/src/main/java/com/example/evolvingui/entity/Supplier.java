package com.example.evolvingui.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String item;

    @Column(name = "delivery_time", nullable = false)
    private Integer deliveryTime;

    @Column(name = "rejection_rate")
    private Double rejectionRate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }

    public Integer getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(Integer deliveryTime) { this.deliveryTime = deliveryTime; }

    public Double getRejectionRate() { return rejectionRate; }
    public void setRejectionRate(Double rejectionRate) { this.rejectionRate = rejectionRate; }
}