package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        java.math.BigDecimal calculatedTotal = java.math.BigDecimal.ZERO;

        // Valida se o cliente existe
        Client client = clientRepository.findById(order.getClient().getId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));
        order.setClient(client);

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order); // Relacionamento bidirecional

                // Busca o produto no banco para pegar o preço de venda exato
                Product productDB = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));

                // Congela o preço de venda no momento do pedido (garante o histórico)
                item.setUnitPrice(productDB.getSalePrice());

                // Soma (Preço Unitário * Quantidade) ao total do pedido
                java.math.BigDecimal itemTotal = item.getUnitPrice().multiply(new java.math.BigDecimal(item.getQuantity()));
                calculatedTotal = calculatedTotal.add(itemTotal);
            }
        }

        order.setTotalAmount(calculatedTotal);

        // Se a requisição não mandar status, define valores padrão
        if (order.getStatus() == null) order.setStatus("Pendente");
        if (order.getPaymentStatus() == null) order.setPaymentStatus("Aguardando Sinal");

        return ResponseEntity.ok(orderRepository.save(order));
    }

    // Método focado em atualizar apenas o Status e o Pagamento do pedido (muito comum no dia a dia)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus) {

        return orderRepository.findById(id).map(order -> {
            if (status != null) order.setStatus(status);
            if (paymentStatus != null) order.setPaymentStatus(paymentStatus);
            return ResponseEntity.ok(orderRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}