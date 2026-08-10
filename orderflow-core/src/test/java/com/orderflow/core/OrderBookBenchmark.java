package com.orderflow.core;

import com.orderflow.core.engine.MultiSymbolMatchingEngine;
import com.orderflow.core.model.Order;
import com.orderflow.core.model.Side;
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@State(Scope.Thread)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MICROSECONDS)
@Warmup(iterations = 2, time = 1)
@Measurement(iterations = 3, time = 1)
@Fork(1)
public class OrderBookBenchmark {

    private MultiSymbolMatchingEngine engine;
    private Random random;
    private long orderId;

    @Setup
    public void setup() {
        engine = new MultiSymbolMatchingEngine();
        random = new Random(42);
        orderId = 1L;
    }

    @Benchmark
    public void testOrderInsertion() {
        double price = 150.0 + (random.nextInt(20) * 0.5);
        Side side = random.nextBoolean() ? Side.BUY : Side.SELL;
        
        Order order = new Order();
        order.populate(
            orderId++,
            "AAPL",
            side,
            price,
            100,
            System.currentTimeMillis()
        );

        engine.processOrder(order);
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(OrderBookBenchmark.class.getSimpleName())
                .build();

        new Runner(opt).run();
    }
}