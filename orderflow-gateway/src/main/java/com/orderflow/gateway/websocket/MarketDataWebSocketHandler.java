package com.orderflow.gateway.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Component
public class MarketDataWebSocketHandler implements WebSocketHandler {

    // Multicast Sink to push broadcast updates to all active sessions
    private final Sinks.Many<String> marketDataSink = Sinks.many().multicast().onBackpressureBuffer();

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        Flux<WebSocketMessage> outputEvents = marketDataSink.asFlux()
                .map(session::textMessage);

        return session.send(outputEvents);
    }

    public void broadcastExecution(String tradeJson) {
        marketDataSink.tryEmitNext(tradeJson);
    }
}