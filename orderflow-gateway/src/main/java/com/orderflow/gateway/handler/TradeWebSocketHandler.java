package com.orderflow.gateway.handler;

import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.core.engine.MultiSymbolMatchingEngine;
import com.orderflow.core.model.OrderBookDepth;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class TradeWebSocketHandler implements WebSocketHandler {

    private final MultiSymbolMatchingEngine matchingEngine;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TradeWebSocketHandler(MultiSymbolMatchingEngine matchingEngine) {
        this.matchingEngine = matchingEngine;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String query = session.getHandshakeInfo().getUri().getQuery();
        String extractedSymbol = "AAPL";

        if (query != null && query.contains("symbol=")) {
            for (String param : query.split("&")) {
                if (param.startsWith("symbol=")) {
                    extractedSymbol = param.split("=")[1].toUpperCase();
                    break;
                }
            }
        }

        final String symbol = extractedSymbol;

        Flux<WebSocketMessage> messageFlux = Flux.interval(Duration.ofMillis(100))
                .map(seq -> {
                    try {
                        OrderBookDepth snapshot = matchingEngine.getDepthSnapshot(symbol);
                        String json = objectMapper.writeValueAsString(snapshot);
                        return session.textMessage(json);
                    } catch (Exception e) {
                        return session.textMessage("{\"symbol\":\"" + symbol + "\",\"bids\":[],\"asks\":[]}");
                    }
                });

        return session.send(messageFlux);
    }
}