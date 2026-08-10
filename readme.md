Markdown# 🚀 OrderFlow — High-Throughput Matching Engine & Terminal

OrderFlow is an ultra-low-latency, event-driven stock matching engine and real-time trading terminal built with Java 21, LMAX Disruptor 4.0, Spring Boot 3 WebFlux, and React 18. It simulates high-frequency trading (HFT) double-auction matching, sub-second L2 market depth visual streams, short-selling execution, and real-time portfolio PnL tracking.

🏛️ Comprehensive Architecture & Flow Diagrams
1. High-Level End-to-End System Topology
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
2. Lock-Free Ring Buffer Processing Pipeline (LMAX Disruptor)Plaintext  [ Incoming HTTP Order ]
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
3. Price-Time Priority Double-Auction Engine (OrderBook.java)Plaintext                  OFFER / ASKS (SELLERS) ── Sorted Ascending (Lowest Price First)
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
4. Interactive Short Selling & Position PnL LifecyclePlaintext [ User Action: Click "Sell / Short" 10 Units @ $185.00 ]
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
🔌 Complete API Reference & Spring Framework IndexThis section outlines all HTTP REST and WebSocket endpoints in the gateway module, specifying their controller handlers, URL patterns, payloads, and exact Spring Framework annotations and imports used.API 1: Submit Order Endpoint (REST HTTP)HTTP Method & Path: POST /api/v1/ordersController Class: com.orderflow.gateway.controller.OrderControllerService Class: com.orderflow.gateway.service.OrderGatewayServiceRisk Filter: com.orderflow.gateway.service.PreTradeRiskServiceWhat It Does: Accepts inbound trading orders from the React frontend or algorithmic clients. Runs pre-trade validation (verifying valid prices, non-zero quantities, and a $1,000,000 max order cap). Assigns an atomic order ID and submits the order to the LMAX Disruptor ring buffer producer.Spring Framework Annotations Used:@RestController: Declares the class as a reactive Spring HTTP endpoint handler.@RequestMapping("/api/v1/orders"): Maps the base URI path.@PostMapping: Binds HTTP POST requests.@RequestBody: Deserializes JSON payloads into OrderRequest Java objects.Spring & Reactor Package Imports:Java// Spring Web Framework Annotations
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Spring HTTP Response Wrappers
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Project Reactor Non-Blocking Types
import reactor.core.publisher.Mono;

// Spring Dependency Injection
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Component;
Request Payload (OrderRequest JSON):JSON{
  "symbol": "AAPL",
  "price": 185.50,
  "quantity": 10,
  "isBuy": true,
  "isLimitOrder": true
}
Response Payload (OrderResponse JSON - 200 OK):JSON{
  "status": "ACCEPTED",
  "message": "Order submitted to matching pipeline",
  "timestamp": 1723285123000
}
Error Response Payload (400 BAD REQUEST - Risk Rejection):JSON{
  "status": "REJECTED",
  "message": "Failed pre-trade risk checks",
  "timestamp": 1723285123005
}
API 2: Live L2 Market Depth Stream (WebSocket API)Protocol & Path: WS /ws/trades?symbol={TICKER} (e.g., ws://localhost:8080/ws/trades?symbol=AAPL)Handler Class: com.orderflow.gateway.handler.TradeWebSocketHandlerConfig Class: com.orderflow.gateway.websocket.WebSocketConfigPublisher Class: com.orderflow.gateway.websocket.WebSocketPublisherWhat It Does: Establishes a non-blocking, bidirectional WebSocket handshake with the React client. Parses the ticker symbol from query parameters, polls the MultiSymbolMatchingEngine for L2 order book snapshots, and streams top bid/ask price levels to the browser canvas every 100 milliseconds.Spring Framework Interfaces & Beans Used:WebSocketHandler: Spring WebFlux reactive contract for managing raw WebSocket sessions and message streams.SimpleUrlHandlerMapping: Maps custom URL routes (/ws/trades) to WebFlux handlers.Spring & Reactor Package Imports:Java// Spring WebFlux Reactive WebSockets
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;

// Spring WebFlux Dispatcher Mapping
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;

// Spring Core Configuration Beans
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

// Reactive Stream Publishers & Sinks
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
Stream Output Payload (JSON pushed every 100ms):JSON{
  "symbol": "AAPL",
  "bids": [
    { "price": 185.30, "volume": 150 },
    { "price": 185.10, "volume": 320 },
    { "price": 184.90, "volume": 450 }
  ],
  "asks": [
    { "price": 185.70, "volume": 120 },
    { "price": 185.90, "volume": 280 },
    { "price": 186.10, "volume": 410 }
  ],
  "timestamp": 1723285123100
}
API 3: Gateway CORS Configuration (WebFlux Config)Class: com.orderflow.gateway.config.WebConfigWhat It Does: Configures non-blocking Cross-Origin Resource Sharing (CORS) rules. Allows the React Vite frontend operating at http://localhost:5173 to make HTTP calls and initiate WebSocket handshakes without browser security blocks.Spring Packages Used:Javaimport org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;
📦 Package Directory & Component GuideBackend (orderflow-core & orderflow-gateway)Package NameCore ClassesFunction & Responsibilitiescom.orderflow.core.modelOrder.java, Side.java, OrderBookDepth.javaZero-GC domain DTOs. Includes populate() for memory re-use.com.orderflow.core.engineOrderBook.java, MultiSymbolMatchingEngine.javaDouble-auction matching engine using TreeMap navigation.com.orderflow.core.riskCoreRiskFilter.javaMicrosecond pre-execution risk validation filter.com.orderflow.gateway.configWebConfig.java, WebSocketConfig.javaReactive CORS policy and WebFlux handler registrations.com.orderflow.gateway.controllerOrderController.javaReactive HTTP REST endpoints (POST /api/v1/orders).com.orderflow.gateway.dtoOrderRequest.java, OrderResponse.javaInbound JSON request and outbound response DTOs.com.orderflow.gateway.handlerTradeWebSocketHandler.javaStreams order book snapshots over WebFlux WebSockets.com.orderflow.gateway.serviceOrderGatewayService.java, PreTradeRiskService.javaOrchestrates atomic order IDs and Disruptor ring buffer publishing.Frontend (orderflow-ui)File PathPurpose & Visual Experiencesrc/components/Navbar.jsxTop bar showing title, navigation tabs, and pulsing WS CONNECTED / DISCONNECTED status badge.src/components/MarketHeader.jsxLive ticker bar for AAPL, TSLA, NVDA, BTC, ETH with fund management buttons (+$5k / -$5k).src/components/OrderBookCanvas.jsxHTML5 Canvas visual depth ladder drawing bid/ask depth bars. Clicking a row auto-fills order price.src/components/OrderBetForm.jsxTrade execution card supporting Market/Limit orders, LONG / SHORT position badges, and real-time floating PnL.src/components/PortfolioChart.jsxLive net worth area chart rendering portfolio value changes as market rates shift.src/components/TradeHistory.jsxOrder execution table logging executed trades, timestamps, quantities, and sides.src/pages/TerminalPage.jsxAssembles header, L2 canvas, trading form, and valuation charts into a unified workspace.src/pages/AnalyticsPage.jsxDedicated dashboard featuring liquid funds, invested capital, risk status, and active position breakdown.src/store/useOrderStore.jsGlobal Zustand store holding account balance, active positions, floating PnL, and sub-second rate fluctuations.src/hooks/useOrderWebSocket.jsCustom React hook maintaining WebSocket connection to ws://localhost:8080/ws/trades?symbol=....🛠️ Summary of Spring Boot Modules UsedMaven ModuleDependency NamePurpose & Features Enabledspring-boot-starter-webfluxSpring WebFlux CoreNon-blocking reactive HTTP endpoints (Mono/Flux), Netty embedded server.spring-boot-starter-webfluxReactive WebSocketsStreaming real-time L2 depth updates via WebSocketHandler.spring-boot-starter-testSpring Test FrameworkJUnit 5 testing engine and reactive web test client support.🚀 How to Build & Run1. Build & Launch BackendRun from the root project directory (/Users/apple/Desktop/orderflow):Bash# Build Java binaries skipping unit tests
mvn clean package -DskipTests

# Run Gateway application
java -jar orderflow-gateway/target/orderflow-gateway-1.0-SNAPSHOT.jar
The Spring Boot gateway starts on port 8080.2. Launch React FrontendRun from the UI directory (/Users/apple/Desktop/orderflow/orderflow-ui/my-app):Bashcd orderflow-ui/my-app
npm install
npm run dev
Access the terminal in your browser at http://localhost:5173.
