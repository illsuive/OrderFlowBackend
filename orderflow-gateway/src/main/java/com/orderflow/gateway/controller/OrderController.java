package com.orderflow.gateway.controller;

import com.lmax.disruptor.RingBuffer;
import com.orderflow.core.disruptor.OrderEvent;
import com.orderflow.core.risk.RiskManager;
import com.orderflow.gateway.dto.OrderRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final RingBuffer<OrderEvent> ringBuffer;
    private final AtomicLong orderIdSequence = new AtomicLong(1000);

    public OrderController(RingBuffer<OrderEvent> ringBuffer) {
        this.ringBuffer = ringBuffer;
    }

    @PostMapping
    public Mono<ResponseEntity<String>> submitOrder(@RequestBody OrderRequestDto request) {
        return Mono.fromCallable(() -> {
            long orderId = orderIdSequence.incrementAndGet();

            // 1. Claim next slot in the lock-free Ring Buffer
            long sequence = ringBuffer.next();
            try {
                OrderEvent event = ringBuffer.get(sequence);
                event.set(
                    orderId,
                    request.getSymbol(),
                    request.getPrice(),
                    request.getQuantity(),
                    request.isBuy()
                );

                // 2. Pre-Trade Risk Check
                if (!RiskManager.validate(event)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Order rejected by pre-trade risk engine.");
                }

            } finally {
                // 3. Commit event to the Ring Buffer[cite: 1]
                ringBuffer.publish(sequence);
            }

            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body("Order submitted successfully. OrderID: " + orderId);
        });
    }
}