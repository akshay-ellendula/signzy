# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                              │
│                                                                                 │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐ ┌─────────┐ ┌──────┐ ┌──────────┐  │
│  │ Dashboard │ │ Vendors  │ │Route Tester│ │ Metrics │ │ Logs │ │AI  Rules │  │
│  └─────┬─────┘ └────┬─────┘ └─────┬──────┘ └────┬────┘ └──┬───┘ └────┬─────┘  │
│        └─────────────┴─────────────┴─────────────┴─────────┴──────────┘        │
│                                    │ axios                                      │
└────────────────────────────────────┼────────────────────────────────────────────┘
                                     │ HTTP (JSON)
┌────────────────────────────────────┼────────────────────────────────────────────┐
│                         EXPRESS API SERVER (:5000)                               │
│                                    │                                            │
│  ┌─────────────────────────────────┼──────────────────────────────────────────┐ │
│  │                          MIDDLEWARE LAYER                                  │ │
│  │  ┌──────────┐  ┌────────────────┐  ┌─────────────┐  ┌──────────────────┐  │ │
│  │  │   CORS   │  │ Zod Validation │  │   Morgan    │  │  Error Handler   │  │ │
│  │  └──────────┘  └────────────────┘  └─────────────┘  └──────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                            │
│  ┌─────────────────────────────────┼──────────────────────────────────────────┐ │
│  │                           ROUTE HANDLERS                                   │ │
│  │                                                                            │ │
│  │  POST /vendors          GET /vendors          PUT /vendors/:id             │ │
│  │  DELETE /vendors/:id    POST /route           GET /vendor-metrics          │ │
│  │  GET /routing-logs      GET /health           POST /ai-rule-generator     │ │
│  │  POST /routing-configs  GET /routing-configs  GET /strategy-recommendation│ │
│  │  GET /fallback-suggestions    POST /agent/explain-routing   GET /settings │ │
│  └─────────────────────────────────┼──────────────────────────────────────────┘ │
│                                    │                                            │
│  ┌─────────────────────────────────┼──────────────────────────────────────────┐ │
│  │                          ROUTING ENGINE                                    │ │
│  │                                                                            │ │
│  │  ┌─────────────┐    ┌────────────────┐    ┌──────────────────────┐        │ │
│  │  │   Filter    │───▶│  Strategy      │───▶│  Failover Loop       │        │ │
│  │  │  Vendors    │    │  Selector      │    │  (retry next-best)   │        │ │
│  │  └─────────────┘    └────────────────┘    └──────────┬───────────┘        │ │
│  │        │                    │                         │                    │ │
│  │  Filters out:         8 Strategies:           On failure/timeout:          │ │
│  │  • Down vendors       • Priority              • Try next vendor           │ │
│  │  • Unhealthy          • Weighted              • Record attempt            │ │
│  │  • Rate-limited       • Round Robin           • Update metrics            │ │
│  │  • Missing feature    • Lowest Latency        • Circuit breaker check     │ │
│  │  • High latency       • Lowest Cost                                       │ │
│  │                       • Health Based                                       │ │
│  │                       • Failover                                           │ │
│  │                       • Feature Based                                      │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                            │
│  ┌─────────────────────────────────┼──────────────────────────────────────────┐ │
│  │                       VENDOR SIMULATOR                                     │ │
│  │                                                                            │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐              │ │
│  │  │ Vendor A  │  │ Vendor B  │  │ Vendor C  │  │ Vendor D  │  ...         │ │
│  │  │ (PAN,OCR) │  │(PAN,DOC)  │  │ (OCR,SMS) │  │(PAN,PAY)  │              │ │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘              │ │
│  │                                                                            │ │
│  │  Simulates: random latency, success/failure/timeout (configurable rates)   │ │
│  │  Returns: capability-specific realistic mock data                          │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                            │
│  ┌─────────────────────────────────┼──────────────────────────────────────────┐ │
│  │                        SUPPORT SERVICES                                    │ │
│  │                                                                            │ │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐            │ │
│  │  │   Metrics    │  │ Logging Service  │  │ AI Agent Service   │            │ │
│  │  │   Service    │  │ (DB + flat file) │  │ (Google Gemini)    │            │ │
│  │  └──────────────┘  └─────────────────┘  └────────────────────┘            │ │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐            │ │
│  │  │Rate Limiter  │  │ Vendor Cache    │  │Strategy/Fallback   │            │ │
│  │  │(sliding win) │  │ (TTL in-memory) │  │  Advisors          │            │ │
│  │  └──────────────┘  └─────────────────┘  └────────────────────┘            │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                            │
└────────────────────────────────────┼────────────────────────────────────────────┘
                                     │
                        ┌────────────┼────────────┐
                        │    MongoDB (Atlas)       │
                        │                          │
                        │  ┌────────────────────┐  │
                        │  │     Vendors         │  │
                        │  │  (config + metrics) │  │
                        │  ├────────────────────┤  │
                        │  │   RoutingLogs       │  │
                        │  │ (decision history)  │  │
                        │  ├────────────────────┤  │
                        │  │  RoutingConfigs     │  │
                        │  │ (AI-generated rules)│  │
                        │  └────────────────────┘  │
                        └──────────────────────────┘
```

## Request Flow

```
Client                API Server              Routing Engine           Vendor Simulator
  │                      │                         │                        │
  │  POST /route         │                         │                        │
  │─────────────────────▶│                         │                        │
  │                      │  1. Validate (Zod)      │                        │
  │                      │  2. Resolve strategy     │                        │
  │                      │  3. Load conditions      │                        │
  │                      │─────────────────────────▶│                        │
  │                      │                         │  4. Filter vendors      │
  │                      │                         │     (down/unhealthy/    │
  │                      │                         │      rate-limited/      │
  │                      │                         │      missing feature)   │
  │                      │                         │                        │
  │                      │                         │  5. Rank by strategy   │
  │                      │                         │  6. Apply conditions   │
  │                      │                         │                        │
  │                      │                         │  7. Try Vendor A       │
  │                      │                         │───────────────────────▶│
  │                      │                         │       ✗ FAILURE        │
  │                      │                         │◀───────────────────────│
  │                      │                         │  8. Record metrics     │
  │                      │                         │  9. Try Vendor B       │
  │                      │                         │───────────────────────▶│
  │                      │                         │       ✓ SUCCESS        │
  │                      │                         │◀───────────────────────│
  │                      │                         │ 10. Record metrics     │
  │                      │◀────────────────────────│ 11. Create routing log │
  │                      │                         │                        │
  │  Standardized JSON   │                         │                        │
  │◀─────────────────────│                         │                        │
  │  (client never       │                         │                        │
  │   knows which        │                         │                        │
  │   vendor was used)   │                         │                        │
```

## Circuit Breaker State Machine

```
                    ┌──────────────────────────┐
                    │                          │
         success   │     CLOSED (healthy)     │   error rate exceeds
        ┌──────────│   Vendor is available    │────────────┐
        │          │   for normal routing     │            │
        │          └──────────────────────────┘            │
        │                      ▲                           ▼
        │                      │                 ┌──────────────────────┐
        │               probe  │                 │                      │
        │              succeeds│                 │   OPEN (unhealthy)   │
        │                      │                 │   Vendor excluded    │
        │          ┌───────────┴──────────┐      │   from routing       │
        │          │                      │      └──────────┬───────────┘
        │          │  HALF-OPEN (probe)   │                 │
        └─────────▶│  One request allowed │◀────────────────┘
                   │  after cooldown      │    cooldown expires
                   └──────────────────────┘
```

## Design Patterns Used

| Pattern | Where Used | Purpose |
|---------|-----------|---------|
| **Strategy** | `server/strategies/*.js` | Each routing algorithm is a pluggable strategy with a common `rank()` interface |
| **MVC** | `controllers/`, `models/`, `services/` | Separation of concerns between request handling, data, and business logic |
| **Circuit Breaker** | `metricsService.js` | Auto-trips unhealthy vendors, half-open recovery after cooldown |
| **Factory** | `strategies/index.js` | `getStrategy(name)` returns the correct strategy implementation |
| **Observer** | `metricsService.js` | Every vendor attempt updates metrics which may trigger health status changes |
| **Cache-Aside** | `vendorCache.js` | In-memory TTL cache for vendor list to reduce DB queries |
