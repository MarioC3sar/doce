package com.example.demo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private String deliveryDate; // Vamos usar String (ex: "25/10/2026 14:00") para facilitar o tráfego com o mobile

    private java.math.BigDecimal totalAmount; // Soma de todos os itens do pedido

    private String status; // Ex: "Produção", "Pronto", "Entregue"

    private String paymentStatus; // Ex: "Sinal Pendente", "Sinal Pago", "Pago Total"

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public void setId(Long id) {
        this.id = id;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public void setDeliveryDate(String deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public Client getClient() {
        return client;
    }

    public String getDeliveryDate() {
        return deliveryDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    // Gere os Getters e Setters (Alt + Insert)
}