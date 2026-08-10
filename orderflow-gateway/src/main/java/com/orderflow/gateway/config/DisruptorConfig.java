package com.orderflow.gateway.config;

import com.lmax.disruptor.RingBuffer;
import com.lmax.disruptor.dsl.Disruptor;
import com.lmax.disruptor.util.DaemonThreadFactory;
import com.orderflow.core.disruptor.OrderEvent;
import com.orderflow.core.disruptor.OrderEventFactory;
import com.orderflow.core.engine.MatchingEventHandler;
import com.orderflow.core.engine.OrderBook;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DisruptorConfig {

    private static final int BUFFER_SIZE = 1024 * 16; // Must be power of 2 (16,384 slots)

    @Bean
    public OrderBook orderBook() {
        return new OrderBook("AAPL");
    }

    @Bean
    public RingBuffer<OrderEvent> ringBuffer(OrderBook orderBook) {
        MatchingEventHandler eventHandler = new MatchingEventHandler(orderBook);

        Disruptor<OrderEvent> disruptor = new Disruptor<>(
                new OrderEventFactory(),
                BUFFER_SIZE,
                DaemonThreadFactory.INSTANCE
        );

        // Connect the consumer handler to the ring buffer lock-free
        disruptor.handleEventsWith(eventHandler);
        
        // Start the Disruptor thread and export the RingBuffer bean
        return disruptor.start();
    }
}