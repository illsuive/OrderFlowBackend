package com.orderflow.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.orderflow.core.engine.MultiSymbolMatchingEngine;

@SpringBootApplication
public class OrderFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderFlowApplication.class, args);
    }

    /**
     * Exposes the core MultiSymbolMatchingEngine instance as a Spring Singleton Bean 
     * so it can be injected into OrderGatewayService and TradeWebSocketHandler.
     */
    @Bean
    public MultiSymbolMatchingEngine multiSymbolMatchingEngine() {
        return new MultiSymbolMatchingEngine();
    }
}