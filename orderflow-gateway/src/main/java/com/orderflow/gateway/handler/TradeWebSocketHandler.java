package com.orderflow.gateway.handler;

import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class TradeWebSocketHandler implements WebSocketHandler {

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        // Extract symbol query param from ws://localhost:8080/ws/trades?symbol=TSLA
        String query = session.getHandshakeInfo().getUri().getQuery();
        String symbol = "AAPL";

        if (query != null && query.contains("symbol=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("symbol=")) {
                    symbol = param.split("=")[1].toUpperCase();
                    break;
                }
            }
        }

        final String activeSymbol = symbol;

        // Broadcast symbol-specific L2 market depth snapshot
        Flux<WebSocketMessage> messageFlux = Flux.interval(Duration.ofMillis(100))
                .map(sequence -> session.textMessage(
                        String.format("{\"symbol\":\"%s\",\"bids\":[{\"price\":150.00,\"volume\":500}],\"asks\":[{\"price\":151.00,\"volume\":400}]}", activeSymbol)
                ));

        return session.send(messageFlux);
    }
}