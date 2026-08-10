package com.orderflow.core.disruptor;

import com.lmax.disruptor.BusySpinWaitStrategy;
import com.lmax.disruptor.RingBuffer;
import com.lmax.disruptor.dsl.Disruptor;
import com.lmax.disruptor.dsl.ProducerType;
import com.lmax.disruptor.util.DaemonThreadFactory;
import com.orderflow.core.engine.MultiSymbolMatchingEngine;
import com.orderflow.core.event.OrderEvent;
import com.orderflow.core.event.OrderEventFactory;

public class DisruptorProvider {

    private static final int BUFFER_SIZE = 16384; // Must be power of 2
    private final Disruptor<OrderEvent> disruptor;
    private final RingBuffer<OrderEvent> ringBuffer;

    @SuppressWarnings("unchecked")
    public DisruptorProvider(MultiSymbolMatchingEngine matchingEngine) {
        OrderEventFactory factory = new OrderEventFactory();

        // Single producer, busy-spin wait strategy for ultra-low latency execution
        this.disruptor = new Disruptor<>(
                factory,
                BUFFER_SIZE,
                DaemonThreadFactory.INSTANCE,
                ProducerType.MULTI,
                new BusySpinWaitStrategy()
        );

        // Connect consumer handler
        disruptor.handleEventsWith(new MatchingEventHandler(matchingEngine));

        // Start Disruptor thread pipeline
        this.ringBuffer = disruptor.start();
    }

    /**
     * Publishes order into the RingBuffer without allocating heap memory.
     */
    public void publishOrder(long orderId, String symbol, double price, int quantity, boolean isBuy, boolean isLimitOrder) {
        long sequence = ringBuffer.next();
        try {
            OrderEvent event = ringBuffer.get(sequence);
            event.set(
                orderId,
                symbol,
                price,
                quantity,
                isBuy,
                isLimitOrder,
                System.currentTimeMillis()
            );
        } finally {
            ringBuffer.publish(sequence);
        }
    }

    public void shutdown() {
        disruptor.shutdown();
    }
}