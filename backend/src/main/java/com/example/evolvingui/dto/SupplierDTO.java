package com.example.evolvingui.dto;

public class SupplierDTO {
    private Long id;
    private String item;
    private Integer deliveryTime;
    private Double rejectionRate;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public Integer getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(Integer deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public Double getRejectionRate() {
        return rejectionRate;
    }

    public void setRejectionRate(Double rejectionRate) {
        this.rejectionRate = rejectionRate;
    }
}