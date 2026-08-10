package com.orderflow.core.disruptor;

import com.lmax.disruptor.RingBuffer;

public class OrderEventProducer {

    private final RingBuffer<OrderEvent> ringBuffer;

    public OrderEventProducer(RingBuffer<OrderEvent> ringBuffer) {
        this.ringBuffer = ringBuffer;
    }

    /**
     * Claims the next sequence slot in the Ring Buffer, populates data,
     * and publishes the event to downstream consumers lock-free[cite: 1].
     */
    public void onData(long orderId, String symbol, double price, int quantity, boolean isBuy) {
        long sequence = ringBuffer.next();
        try {
            OrderEvent event = ringBuffer.get(sequence);
            event.set(orderId, symbol, price, quantity, isBuy);
        } finally {
            ringBuffer.publish(sequence);
        }
    }
}