package com.orderflow.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.orderflow.gateway.dto.OrderRequest;
import com.orderflow.gateway.dto.OrderResponse;
import com.orderflow.gateway.service.OrderGatewayService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderGatewayService orderGatewayService;

    public OrderController(OrderGatewayService orderGatewayService) {
        this.orderGatewayService = orderGatewayService;
    }

    @PostMapping
    public Mono<ResponseEntity<OrderResponse>> createOrder(@RequestBody OrderRequest request) {
        return Mono.fromCallable(() -> {
            boolean accepted = orderGatewayService.submitOrder(request);
            if (accepted) {
                return ResponseEntity.ok(new OrderResponse("ACCEPTED", "Order submitted to matching pipeline"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new OrderResponse("REJECTED", "Failed pre-trade risk checks"));
            }
        });
    }
}