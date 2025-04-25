package com.example.evolvingui.entity;

       import jakarta.persistence.*;

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
           public String getItem() { return item; }
           public Integer getDeliveryTime() { return deliveryTime; }
           public Double getRejectionRate() { return rejectionRate; }
       }