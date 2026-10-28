package com.example.demo.controller;

import com.example.demo.model.Client;
import com.example.demo.model.Order;
import com.example.demo.repository.ClientRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientControllerTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ClientController clientController;

    @InjectMocks
    private OrderController orderController;

    @Test
    void deleteClientMarksInactiveInsteadOfDeletingRow() {
        Client client = new Client();
        client.setId(12L);
        when(clientRepository.findById(12L)).thenReturn(Optional.of(client));

        ResponseEntity<Void> response = clientController.deleteClient(12L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertFalse(client.isActive());
        verify(clientRepository).save(client);
        verify(clientRepository, never()).deleteById(anyLong());
    }

    @Test
    void inactiveClientCannotReceiveNewOrders() {
        Client client = new Client();
        client.setId(12L);
        client.setActive(false);
        Order order = new Order();
        order.setClient(client);
        when(clientRepository.findById(12L)).thenReturn(Optional.of(client));
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> orderController.createOrder(order)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verifyNoInteractions(productRepository, orderRepository);
    }
}
