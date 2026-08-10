package com.orderflow.core;

import com.orderflow.core.engine.OrderBook;
import com.orderflow.core.model.Order;
import com.orderflow.core.model.Side;
import org.openjdk.jmh.annotations.*;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@BenchmarkMode({Mode.Throughput, Mode.AverageTime})
@OutputTimeUnit(TimeUnit.MICROSECONDS)
@State(Scope.Thread)
@Warmup(iterations = 3, time = 1)
@Measurement(iterations = 5, time = 2)
@Fork(1)
public class OrderBookBenchmark {

    private OrderBook orderBook;
    private Order[] preAllocatedOrders;
    private int index = 0;
    private static final int NUM_ORDERS = 10_000;

    @Setup(Level.Trial)
    public void setup() {
        orderBook = new OrderBook("AAPL");
        preAllocatedOrders = new Order[NUM_ORDERS];
        Random random = new Random(42);

        // Pre-allocate orders to eliminate garbage collection impact during benchmarking
        for (int i = 0; i < NUM_ORDERS; i++) {
            Order order = new Order();
            Side side = (i % 2 == 0) ? Side.BUY : Side.SELL;
            double price = 150.0 + (random.nextDouble() * 10 - 5); // Price around 150.0
            int qty = random.nextInt(100) + 1;
            
            order.populate(i, side, price, qty, System.nanoTime());
            preAllocatedOrders[i] = order;
        }
    }

    @Benchmark
    public void testOrderMatchingLatency() {
        Order order = preAllocatedOrders[index];
        orderBook.processOrder(order);
        
        index = (index + 1) % NUM_ORDERS;
    }

    public static void main(String[] args) throws Exception {
        org.openjdk.jmh.Main.main(args);
    }
}