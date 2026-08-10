package com.orderflow.core.model;

import java.util.List;

public class OrderBookDepth {
    private final String symbol;
    private final List<PriceLevelDto> bids;
    private final List<PriceLevelDto> asks;
    private final long timestamp;

    public OrderBookDepth(String symbol, List<PriceLevelDto> bids, List<PriceLevelDto> asks) {
        this.symbol = symbol;
        this.bids = bids;
        this.asks = asks;
        this.timestamp = System.currentTimeMillis();
    }

    public static class PriceLevelDto {
        private final double price;
        private final int volume;

        public PriceLevelDto(double price, int volume) {
            this.price = price;
            this.volume = volume;
        }

        public double getPrice() {
            return price;
        }

        public int getVolume() {
            return volume;
        }

        @Override
        public String toString() {
            return "PriceLevelDto{" +
                    "price=" + price +
                    ", volume=" + volume +
                    '}';
        }
    }

    public String getSymbol() {
        return symbol;
    }

    public List<PriceLevelDto> getBids() {
        return bids;
    }

    public List<PriceLevelDto> getAsks() {
        return asks;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "OrderBookDepth{" +
                "symbol='" + symbol + '\'' +
                ", bids=" + bids +
                ", asks=" + asks +
                ", timestamp=" + timestamp +
                '}';
    }
}