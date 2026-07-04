# Explanation of Routing Decisions

This document explains how the Intelligent Vendor Routing Platform makes routing decisions, including how each strategy works, how failover is handled, and how the circuit breaker protects the system.

---

## How a Routing Decision is Made

When a `POST /route` request arrives, the routing engine follows this pipeline:

### Step 1: Resolve Strategy
If `strategy` is provided in the request, it's used directly. Otherwise:
- If `requirements.preferLowCost` is `true` → `lowestCost` strategy
- Default → `priority` strategy

### Step 2: Load Conditions
If `conditions` are provided in the request body, those are used. Otherwise, the engine checks for an active `RoutingConfig` in the database matching the request's `capability` and uses its conditions automatically.

### Step 3: Filter Vendors
Before ranking, vendors are **excluded** if any of these apply:

| Filter | Reason |
|--------|--------|
| `isActive === false` | Vendor manually disabled |
| `healthStatus === "unhealthy"` | Circuit breaker tripped (unless cooldown expired — then one probe is allowed) |
| Rate limit exceeded | Vendor's sliding-window request count ≥ `rateLimitPerMinute` |
| Missing capability | Vendor's `supportedFeatures` does not include the requested `capability` |
| Latency too high | Vendor's `currentLatency` exceeds `maxLatencyMs` (from request) or global `LATENCY_THRESHOLD_MS` |

Each filtered-out vendor is recorded in the `failoverHistory` with reason `"skipped"`.

### Step 4: Rank by Strategy
The remaining eligible vendors are ranked by the selected strategy (see details below).

### Step 5: Apply Conditions
If conditions exist (e.g., "switch to Vendor C if latency > 2000ms"), the condition-override vendor is promoted to the front of the ranked list. This means conditions can override the strategy's ranking.

### Step 6: Attempt with Failover
The engine iterates through the ranked vendor list:
1. **Rate limit check** — a fresh, atomic check per-vendor (not cached)
2. **Call vendor** — the vendor simulator produces a randomized outcome
3. **Record metrics** — update the vendor's rolling stats (success rate, latency, error rate)
4. **If success** → return the standardized response
5. **If failure** → log the attempt in `failoverHistory`, move to next vendor

If all vendors fail, return `status: "FAILURE"` with the complete `failoverHistory`.

### Step 7: Log the Decision
Every routing decision is persisted as a `RoutingLog` with:
- `requestId`, `capability`, `selectedVendor`, `routingStrategy`
- `routingReason` — human-readable explanation
- `failoverHistory` — every vendor attempted, with individual reasons and latencies
- `finalStatus` — `SUCCESS` or `FAILURE`

---

## Routing Strategies Explained

### 1. Priority Based (`priority`)
**Logic:** Sort vendors by `priority` field (ascending — lower number = higher priority).

**When to use:** When you have a clear primary vendor and want a deterministic first-choice.

**Example:** Vendor A (priority=1) is always tried first. If it fails, Vendor B (priority=2) is next.

**Routing reason:** `"Highest priority (priority=1) among eligible vendors"`

---

### 2. Weighted (`weighted`)
**Logic:** Randomly select a vendor proportional to its `weight`. A vendor with weight=70 gets ~70% of traffic versus one with weight=30 getting ~30%.

**When to use:** Traffic splitting across vendors (A/B testing, cost distribution, load balancing).

**Example:** With weights [70, 30], Vendor A gets roughly 70% of requests, Vendor B gets 30%.

**Routing reason:** `"Selected via weighted random selection (weight=70)"`

---

### 3. Round Robin (`roundRobin`)
**Logic:** Maintains a counter and cycles through vendors in order. Vendor A → B → C → A → B → C...

**When to use:** Even distribution without randomness.

**Routing reason:** `"Selected by round-robin rotation (position 2 of 3)"`

---

### 4. Lowest Latency (`lowestLatency`)
**Logic:** Sort vendors by `currentLatency` (ascending). The vendor with the lowest recent latency is tried first.

**When to use:** Performance-critical use cases where speed matters most.

**Example:** Vendor C (450ms avg) is preferred over Vendor A (890ms avg).

**Routing reason:** `"Lowest current latency (450ms) among eligible vendors"`

---

### 5. Lowest Cost (`lowestCost`)
**Logic:** Sort vendors by `costPerRequest` (ascending).

**When to use:** Budget-sensitive operations, bulk processing.

**Example:** Vendor C (₹0.30/req) is preferred over Vendor A (₹1.50/req).

**Routing reason:** `"Lowest cost per request (₹0.3) among eligible vendors"`

---

### 6. Health Based (`healthBased`)
**Logic:** Sort by composite health score: `successRate * availabilityPercentage / 100`. The vendor with the best combined success rate and uptime wins.

**When to use:** When reliability is the top concern and you want to automatically favor the most reliable vendor.

**Routing reason:** `"Best health score (82.9) among eligible vendors"`

---

### 7. Failover (`failover`)
**Logic:** Same as priority-based sorting, but semantically signals "try the primary vendor, and if it fails, try the next one." The failover loop is actually always active regardless of strategy — this strategy just makes the intent explicit.

**When to use:** When you have a clear primary and backup chain.

**Routing reason:** `"Selected as primary in failover chain (priority=1)"`

---

### 8. Feature Based (`featureBased`)
**Logic:** Vendors are first filtered to only those supporting the requested `capability`, then sorted by the number of supported features (descending) — the most versatile vendor is preferred as it's likely a larger, more mature provider.

**When to use:** Multi-capability scenarios where you want the most capable vendor.

**Routing reason:** `"Most supported features (5) among capability-matched vendors"`

---

## Failover Handling

Failover is **built into the routing engine**, not a separate strategy. Every strategy produces a ranked list, and the engine always walks the full list on failure.

### Automatic Failover Triggers
| Trigger | What Happens |
|---------|-------------|
| Vendor returns error | Logged as `"failure"`, next vendor tried |
| Vendor times out | Logged as `"timeout"`, next vendor tried |
| Vendor rate-limited | Logged as `"skipped"`, next vendor tried |
| All vendors fail | Return `status: "FAILURE"` with full `failoverHistory` |

### Failover History Example
```json
{
  "failoverHistory": [
    { "vendor": "Vendor A", "reason": "Vendor rate limit exceeded", "latencyMs": 0, "status": "skipped" },
    { "vendor": "Vendor B", "reason": "Vendor returned an error (simulated failure)", "latencyMs": 350, "status": "failure" },
    { "vendor": "Vendor C", "reason": "Vendor processed the request successfully", "latencyMs": 920, "status": "success" }
  ]
}
```

This shows: Vendor A was skipped (rate-limited), Vendor B was tried but failed, Vendor C succeeded.

---

## Circuit Breaker

The circuit breaker automatically protects the system from repeatedly calling a failing vendor.

### Configuration
| Setting | Default | Description |
|---------|---------|-------------|
| `HIGH_ERROR_RATE_THRESHOLD` | 50% | Error rate that triggers trip |
| `MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK` | 5 | Minimum requests before health evaluation |
| `CIRCUIT_BREAKER_COOLDOWN_MS` | 60,000ms | Time before half-open probe |

### How It Works
1. After each vendor attempt, `metricsService.recordAttempt()` updates the vendor's rolling stats
2. If the error rate exceeds `HIGH_ERROR_RATE_THRESHOLD` AND at least `MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK` requests have been made → vendor is marked `unhealthy`
3. An unhealthy vendor is **excluded from routing** (filtered out in Step 3)
4. After `CIRCUIT_BREAKER_COOLDOWN_MS` elapses, the vendor enters **half-open** state — one probe request is allowed through
5. If the probe **succeeds** → vendor is marked `healthy` again
6. If the probe **fails** → cooldown restarts

---

## Condition-Based Overrides

Conditions (from AI-generated configs or explicit request parameters) can dynamically promote a vendor ahead of the strategy-ranked list.

### Condition Format
```json
{
  "metric": "latency",       // "latency" or "errorRate"
  "operator": ">",           // ">" or "<"
  "value": 2000,             // threshold value
  "vendor": "Vendor C"       // vendor to promote if condition triggers
}
```

### How It Works
When any condition is met (e.g., the top-ranked vendor's latency > 2000ms), the condition's target vendor (`Vendor C`) is moved to position #1 in the ranked list. The routing reason will note: `"(promoted ahead of the top-ranked vendor by a configured condition)"`.

---

## Response Format

Every `/route` response follows the same standardized format, regardless of which vendor was used:

```json
{
  "status": "SUCCESS",
  "vendorUsed": "Vendor B",
  "routingReason": "Lowest cost per request (₹0.8) among eligible vendors",
  "latencyMs": 850,
  "cost": 0.8,
  "response": {
    "panStatus": "VALID",
    "nameMatch": true
  },
  "requestId": "uuid-here",
  "failoverHistory": [...]
}
```

The `response` object contains capability-specific data (PAN verification results, OCR output, SMS status, etc.) but the wrapper is always the same — the **client never needs to know which vendor served the request**.
