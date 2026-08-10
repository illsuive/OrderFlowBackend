package com.orderflow.gateway.dto;

public class OrderResponse {
    private String status;
    private String message;
    private long timestamp;

    public OrderResponse(String status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public String getStatus() { return status; }
    public String getMessage() { return message; }
    public long getTimestamp() { return timestamp; }
}