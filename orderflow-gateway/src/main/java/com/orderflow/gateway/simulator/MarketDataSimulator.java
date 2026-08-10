package com.orderflow.gateway.simulator;

import com.orderflow.core.engine.MultiSymbolMatchingEngine;
import com.orderflow.core.model.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class MarketDataSimulator {

    private final MultiSymbolMatchingEngine engine;
    private final Random random = new Random();
    private double currentPrice = 150.00;

    public MarketDataSimulator(MultiSymbolMatchingEngine engine) {
        this.engine = engine;
    }

    // Executes every 50 milliseconds to simulate high-frequency market updates
    @Scheduled(fixedRate = 50)
    public void generateTicks() {
        // Random price fluctuation (-$0.25 to +$0.25)
        double priceDelta = (random.nextDouble() - 0.5) * 0.50;
        currentPrice = Math.round((currentPrice + priceDelta) * 100.0) / 100.0;

        boolean isBuy = random.nextBoolean();
        int quantity = (random.nextInt(10) + 1) * 10;

        Order simulatedOrder = new Order("AAPL", currentPrice, quantity, isBuy, true);
        engine.processOrder(simulatedOrder);
    }
}