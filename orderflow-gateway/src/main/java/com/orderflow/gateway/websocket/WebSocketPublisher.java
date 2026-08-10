package com.orderflow.gateway.websocket;

import org.springframework.stereotype.Component;

import com.orderflow.core.model.OrderBookDepth;

import reactor.core.publisher.Sinks;

@Component
public class WebSocketPublisher {

    private final Sinks.Many<OrderBookDepth> sink = Sinks.many().multicast().onBackpressureBuffer();

    public void publishDepthUpdate(OrderBookDepth depth) {
        sink.tryEmitNext(depth);
    }

    public Sinks.Many<OrderBookDepth> getSink() {
        return sink;
    }
}