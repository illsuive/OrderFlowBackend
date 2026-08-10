🚀 OrderFlow — High-Throughput Matching Engine & TerminalOrderFlow is a low-latency, event-driven stock matching engine and real-time trading terminal built with Java 21, LMAX Disruptor, Spring Boot WebFlux, and React. It simulates high-frequency trading (HFT) mechanics, sub-second L2 market depth updates, short-selling execution, and real-time portfolio PnL tracking.🏛️ System Architecture OverviewPlaintext┌────────────────────────────────────────────────────────────────────────┐
│                          REACT VITE FRONTEND                           │
│     MarketHeader  │  OrderBookCanvas  │  OrderBetForm  │  Analytics     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  HTTP POST /api/v1/orders │ WebSocket /ws/trades?symbol=AAPL
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ORDERFLOW-GATEWAY (Spring Boot 3)                    │
│   • OrderController          • CoreRiskFilter ($1M Max Cap)            │
│   • OrderGatewayService      • TradeWebSocketHandler (WebFlux Stream)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                            In-Memory RingBuffer
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     ORDERFLOW-CORE (Low Latency Engine)                │
│   • MultiSymbolMatchingEngine • OrderBook (Price-Time Priority)        │
│   • LMAX Disruptor            • Primitive Collections (Zero GC)        │
└────────────────────────────────────────────────────────────────────────┘
📦 Backend Breakdown (orderflow-core & orderflow-gateway)1. com.orderflow.core.modelUsed For: Core data transfer objects and domain models engineered for minimal memory overhead and zero garbage collection (GC) pauses.Key Classes:Order.java: Represents an inbound order with orderId, symbol, side (BUY/SELL), price, quantity, and timestamp. Features an in-place populate() mutator for object pooling.Side.java: Enum defining BUY and SELL.OrderBookDepth.java: Snapshot DTO containing bid/ask price levels for streaming.APIs Used: Internal Java memory structures.2. com.orderflow.core.engineUsed For: The high-frequency matching engine executing price-time priority matching algorithms.Key Classes:OrderBook.java: Manages double-auction bid/ask orders using TreeMap navigation (NavigableMap). Matches aggressive orders against resting passive liquidity.MultiSymbolMatchingEngine.java: Symbol router managing concurrent OrderBook instances (e.g., AAPL, TSLA, BTC) via ConcurrentHashMap.APIs Used: Internal match processing.3. com.orderflow.core.riskUsed For: Pre-execution sanity checks and risk filtering before orders touch the matching book.Key Classes:CoreRiskFilter.java: Rejects bad requests, enforcing a $1,000,000 maximum order cap and 50,000 unit limit.APIs Used: Pre-trade validation rules.4. com.orderflow.gateway.config & websocketUsed For: Gateway routing, CORS configuration, and reactive WebFlux server setup.Key Classes:WebConfig.java: Enables CORS for http://localhost:5173.WebSocketConfig.java: Maps the reactive handler to /ws/trades.OrderFlowApplication.java: Main Spring Boot entrypoint registering the matching engine bean.5. com.orderflow.gateway.controller & serviceUsed For: REST entrypoints and risk orchestration connecting HTTP clients to the execution engine.Key Classes:OrderController.java: Exposes reactive HTTP POST endpoints.OrderGatewayService.java: Assigns order IDs and pushes orders into the LMAX Disruptor ring buffer.APIs Used: POST /api/v1/orders (Accepts OrderRequest JSON, returns OrderResponse).6. com.orderflow.gateway.handlerUsed For: Reactive WebSocket streaming of L2 market depth.Key Classes:TradeWebSocketHandler.java: Streams real-time order book snapshots every 100ms per ticker.APIs Used: WS /ws/trades?symbol={TICKER}🎨 Frontend Architecture (orderflow-ui)Component / FilePurpose & FunctionalityWhere You See It in ActionNavbar.jsxTop header bar showing system title, page tabs, and live engine status.Top bar displaying ORDERFLOW and the pulsing WS CONNECTED / DISCONNECTED status badge.MarketHeader.jsxSub-second price ticker and dynamic fund controls.Top section showing live tickers (AAPL, TSLA, NVDA, BTC, ETH), rate changes, and +$5,000 / -$5,000 buttons.OrderBookCanvas.jsxHTML5 Canvas L2 market depth visualizer.Middle-left visual box drawing bid/ask depth bars and spread line. Clicking any price level auto-fills the order price.OrderBetForm.jsxExecution form supporting Market, Limit, Long, and Short Selling.Middle-right trading card. Handles order execution, displays LONG / SHORT badges, and calculates real-time unrealized PnL.PortfolioChart.jsxLive net worth area chart built with recharts.Bottom chart rendering live portfolio valuation curves as stock rates fluctuate.TradeHistory.jsxOrder execution log table.Bottom table displaying a log of executed orders with timestamps, symbols, quantities, and sides.AnalyticsPage.jsxPortfolio breakdown and active holdings dashboard.Accessible via the Analytics tab. Displays total net worth cards, liquid cash, invested capital, and an Active Holdings table.useOrderStore.jsGlobal Zustand state store.Under the hood: manages funds, active positions, floating PnL, and sub-second rate fluctuations.useOrderWebSocket.jsCustom React WebSocket hook.Under the hood: maintains the ws://localhost:8080/ws/trades?symbol=... stream with auto-reconnects.🔌 API Endpoints Summary1. Submit Order (REST)Endpoint: POST /api/v1/ordersRequest Body:JSON{
  "symbol": "AAPL",
  "price": 185.50,
  "quantity": 10,
  "isBuy": true,
  "isLimitOrder": true
}
Response: 200 OKJSON{
  "status": "ACCEPTED",
  "message": "Order submitted to matching pipeline",
  "timestamp": 1723285123000
}
2. Live L2 Market Depth Stream (WebSocket)Endpoint: ws://localhost:8080/ws/trades?symbol=AAPLStream Payload (Every 100ms):JSON{
  "symbol": "AAPL",
  "bids": [{"price": 185.30, "volume": 150}],
  "asks": [{"price": 185.70, "volume": 120}],
  "timestamp": 1723285123100
}
💡 Key Trading Concepts ImplementedShort Selling (Sell First $\rightarrow$ Buy Later):Users can place a SELL order without prior stock ownership.Calculates profit when market rates drop below average entry price:$$\text{Short PnL} = (\text{Avg Entry Price} - \text{Current Rate}) \times \vert{}\text{Quantity}\vert{}$$Displays dynamic SHORT badges and changes button context to Buy / Cover.Real-time Floating PnL:Calculates unrealized gain/loss continuously across sub-second ticker updates for open positions.Dynamic Fund Management:Users can adjust trading capital on the fly using allocated fund controls.🚀 How to Build & Run1. Launch the Spring Boot BackendFrom the project root directory (/Users/apple/Desktop/orderflow):Bashmvn clean package -DskipTests
java -jar orderflow-gateway/target/orderflow-gateway-1.0-SNAPSHOT.jar
Backend runs Netty on port 8080.2. Launch the React FrontendFrom the React UI directory (orderflow-ui/my-app):Bashcd orderflow-ui/my-app
npm install
npm run dev
Frontend runs on http://localhost:5173.




1. HTTP REST APIsSubmit Order EndpointEndpoint: POST /api/v1/ordersController Class: com.orderflow.gateway.controller.OrderControllerService Class: com.orderflow.gateway.service.OrderGatewayServicePurpose: Receives client order submissions (Market & Limit orders), runs them through pre-trade risk validation (CoreRiskFilter), assigns an order ID, and publishes them to the LMAX Disruptor ring buffer.Spring Annotations Used:@RestController@RequestMapping("/api/v1/orders")@PostMapping@RequestBodySpring Packages Used:Java// Spring Web Framework Core
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Spring Reactive Streams (WebFlux)
import reactor.core.publisher.Mono;

// Spring Framework HTTP Context
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Spring Core DI Dependency Injection
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Component;
2. WebSocket Streaming APIsLive L2 Market Depth StreamEndpoint: WS /ws/trades?symbol={TICKER} (e.g., /ws/trades?symbol=AAPL)Handler Class: com.orderflow.gateway.handler.TradeWebSocketHandlerConfig Class: com.orderflow.gateway.websocket.WebSocketConfigPublisher Class: com.orderflow.gateway.websocket.WebSocketPublisherPurpose: Establishes a non-blocking, reactive WebSocket session with the frontend. Pushes order book depth updates (bids and asks price levels) every 100ms for the requested stock symbol.Spring Interfaces & Beans Used:WebSocketHandlerHandlerMapping (SimpleUrlHandlerMapping)Spring Packages Used:Java// Spring Reactive WebFlux WebSocket
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;

// Spring WebFlux Dispatcher Mapping
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;

// Spring Context & Configuration
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

// Reactive Streams Engine
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
3. Cross-Origin Configuration (CORS)Class: com.orderflow.gateway.config.WebConfigPurpose: Permits cross-origin HTTP/WS requests originating from the React Vite client (http://localhost:5173).Spring Packages Used:Javaimport org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;
Summary of Core Spring Modules UsedMaven Dependency (pom.xml)Spring Module NameCore Features Usedspring-boot-starter-webfluxSpring WebFluxNon-blocking reactive HTTP endpoints (Mono/Flux), WebFlux CORS configuration, and Reactive Netty WebServer.spring-boot-starter-webfluxSpring Reactive WebSocketSub-second streaming of L2 depth snapshots via WebSocketHandler & SimpleUrlHandlerMapping.spring-boot-starter-testSpring TestSpring integration testing support and JUnit 5 extensions.

