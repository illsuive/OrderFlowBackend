# 🚀 OrderFlow — High-Throughput Matching Engine & Terminal

**OrderFlow** is an ultra-low-latency, event-driven stock matching engine and real-time trading terminal built with Java 21, LMAX Disruptor 4.0, Spring Boot 3 WebFlux, and React 18. It simulates high-frequency trading (HFT) double-auction matching, sub-second L2 market depth visual streams, short-selling execution, and real-time portfolio PnL tracking.

---

## 🏛️ Comprehensive Architecture & Flow Diagrams

### 1. High-Level End-to-End System Topology

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     REACT VITE FRONTEND (Port 5173)                             │
│                                                                                                 │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────────────┐  │
│  │   MarketHeader.jsx    │   │  OrderBookCanvas.jsx  │   │        OrderBetForm.jsx           │  │
│  │ Sub-second Rate Ticker │   │ HTML5 L2 Depth Ladder │   │ Market, Limit, Long & Short Form  │  │
│  └───────────┬───────────┘   └───────────▲───────────┘   └─────────────────┬─────────────────┘  │
└──────────────│───────────────────────────│─────────────────────────────────│────────────────────┘
               │                           │                                 │
               │ Rates Interval            │ WebSocket Stream                │ HTTP POST /api/v1/orders
               │ (Local Store)             │ WS /ws/trades?symbol=AAPL       │ (OrderRequest Payload)
               ▼                           │                                 ▼
┌──────────────────────────────────────────┴──────────────────────────────────────────────────────┐
│                                 SPRING BOOT GATEWAY (Port 8080)                                 │
│                                                                                                 │
│    ┌─────────────────────────┐               ┌───────────────────────────────────────────────┐  │
│    │  TradeWebSocketHandler  │               │              OrderController                  │  │
│    │ Non-Blocking Push (100ms)               │            Reactive Mono Producer             │  │
│    └────────────▲────────────┘               └──────────────────────┬────────────────────────┘  │
│                 │                                                   │                           │
│                 │ Snapshots                                         ▼                           │
│                 │                                    ┌──────────────────────────────┐           │
│                 │                                    │      CoreRiskFilter          │           │
│                 │                                    │ Checks ($1M Cap / 50k Qty)   │           │
│                 │                                    └──────────────┬───────────────┘           │
│                 │                                                   │                           │
│                 │                                                   ▼                           │
│                 │                                    ┌──────────────────────────────┐           │
│                 │                                    │     OrderGatewayService      │           │
│                 │                                    │  Assigns Order ID & Publishes│           │
│                 │                                    └──────────────┬───────────────┘           │
└─────────────────│───────────────────────────────────────────────────│───────────────────────────┘
                  │                                                   │
                  │ Reads Depth                                       ▼ Publishes Event
┌─────────────────┴───────────────────────────────────────────────────┴───────────────────────────┐
│                                   ORDERFLOW-CORE (In-Memory HFT)                                │
│                                                                                                 │
│                       ┌───────────────────────────────────────────────────┐                     │
│                       │             LMAX DISRUPTOR RING BUFFER             │                     │
│                       │   (Lock-Free Memory Slot Pre-allocated Queue)     │                     │
│                       └─────────────────────────┬─────────────────────────┘                     │
│                                                 │                                               │
│                                                 ▼ Consumes Event                                │
│                       ┌───────────────────────────────────────────────────┐                     │
│                       │           MultiSymbolMatchingEngine               │                     │
│                       │      Route by Symbol (AAPL, TSLA, NVDA, BTC)      │                     │
│                       └─────────────────────────┬─────────────────────────┘                     │
│                                                 │                                               │
│                                                 ▼ Matches In-Memory                             │
│                       ┌───────────────────────────────────────────────────┐                     │
│                       │                   OrderBook                       │                     │
│                       │    NavigableMap<Price, Queue<Order>> Bids / Asks  │                     │
│                       └───────────────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘




[ Incoming HTTP Order ]
             │
             ▼
┌─────────────────────────┐
│  OrderGatewayService    │ ───► Claims Next Slot in Ring Buffer (Sequence #1024)
└─────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  RING BUFFER (2048 SLOTS)                              │
│                                                                                        │
│   [ Slot 0 ] ──► [ Slot 1 ] ──► ... ──► [ Slot 1024: OrderEvent ] ──► ... ──► [Slot 2047]  │
│                                                    │                                   │
└────────────────────────────────────────────────────│───────────────────────────────────┘
                                                     │
                                                     ▼ Consumer Worker Handlers
                                     ┌───────────────────────────────┐
                                     │     MatchingEventHandler      │
                                     │ Mutates Memory Field In-Place │
                                     └───────────────┬───────────────┘
                                                     │
                                                     ▼
                                     ┌───────────────────────────────┐
                                     │  MultiSymbolMatchingEngine    │
                                     └───────────────────────────────┘




OFFER / ASKS (SELLERS) ── Sorted Ascending (Lowest Price First)
                  ┌──────────────────────┬──────────────────────┬───────────────┐
                  │      Price ($)       │     Volume (QTY)     │    Orders     │
                  ├──────────────────────┼──────────────────────┼───────────────┤
                  │       $186.00        │         450          │ [Order 4]     │
                  │       $185.80        │         200          │ [Order 3]     │
                  │       $185.50        │         100          │ [Order 1]     │ ◄── BEST ASK
                  └──────────────────────┴──────────────────────┴───────────────┘
─────────────────────────────────────────────────────────────────────────────────────
  SPREAD = $0.50  │  MID MARKET PRICE = $185.25
─────────────────────────────────────────────────────────────────────────────────────
                  ┌──────────────────────┬──────────────────────┬───────────────┐
                  │       $185.00        │         300          │ [Order 2]     │ ◄── BEST BID
                  │       $184.80        │         150          │ [Order 5]     │
                  │       $184.50        │         500          │ [Order 6]     │
                  └──────────────────────┴──────────────────────┴───────────────┘
                  BID / BIDS (BUYERS) ── Sorted Descending (Highest Price First)

  Execution Rule:
  • Aggressive BUY Order @ $185.50 sweeps Best Ask ($185.50) instantly.
  • Unfilled passive volume rests on Best Bid tier.   




[ User Action: Click "Sell / Short" 10 Units @ $185.00 ]
                           │
                           ▼
 ┌──────────────────────────────────────────────────┐
 │ Position Stance: SHORT (-10 Qty)                 │
 │ Entry Price:     $185.00                         │
 └─────────────────────────┬────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             │ Sub-Second Rate Updates   │
             └─────────────┬─────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
 🟢 Price Drops to $180.00             🔴 Price Rises to $190.00
 ┌─────────────────────────────┐       ┌─────────────────────────────┐
 │ Short PnL Calculation:      │       │ Short PnL Calculation:      │
 │ ($185.00 - $180.00) * 10   │       │ ($185.00 - $190.00) * 10    │
 │ = +$50.00 Profit (GREEN)    │       │ = -$50.00 Loss (RED)        │
 └─────────────────────────────┘       └─────────────────────────────┘
                           │
                           ▼
 [ User Action: Click "Buy / Cover" 10 Units @ $180.00 ]
                           │
                           ▼
 ┌──────────────────────────────────────────────────┐
 │ Position Stance: CLOSED (0 Qty)                  │
 │ Realized Profit Locked: +$50.00                  │
 └──────────────────────────────────────────────────┘
  
