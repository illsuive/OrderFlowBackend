package com.orderflow.gateway.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.core.engine.OrderBook;
import com.orderflow.core.model.OrderBookDepth;
import com.orderflow.gateway.websocket.MarketDataWebSocketHandler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class MarketDepthBroadcaster {

    private final OrderBook orderBook;
    private final MarketDataWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MarketDepthBroadcaster(OrderBook orderBook, MarketDataWebSocketHandler webSocketHandler) {
        this.orderBook = orderBook;
        this.webSocketHandler = webSocketHandler;
    }

    @Scheduled(fixedRate = 100)
    public void broadcastMarketDepth() {
        try {
            OrderBookDepth depthSnapshot = orderBook.getDepthSnapshot(10);
            String jsonPayload = objectMapper.writeValueAsString(depthSnapshot);
            
            webSocketHandler.broadcastExecution(jsonPayload);
        } catch (Exception e) {
            System.err.println("Failed to broadcast market depth: " + e.getMessage());
        }
    }
}