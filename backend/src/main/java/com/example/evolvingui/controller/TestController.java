package com.example.evolvingui.controller;

       import com.example.evolvingui.repository.SupplierRepository;
       import org.springframework.web.bind.annotation.GetMapping;
       import org.springframework.web.bind.annotation.RestController;

       @RestController
       public class TestController {
           private final SupplierRepository repository;

           public TestController(SupplierRepository repository) {
               this.repository = repository;
           }

           @GetMapping("/test")
           public String test() {
               return "Found " + repository.findAll().size() + " suppliers";
           }
       }