# Full-Marks Implementation Plan
## Intelligent Vendor Routing Platform (Assignment 2)

This plan is built directly against the published **Evaluation Criteria (100 marks)** so every hour of work maps to points on the rubric.

| Criteria | Marks | Where it's covered in this plan |
|---|---|---|
| Vendor routing design | 25 | Phase 3 |
| Failover handling | 15 | Phase 4 |
| Metrics tracking | 15 | Phase 5 |
| Rule/config design | 15 | Phase 2 |
| API design | 10 | Phase 2 & 6 |
| Code quality | 10 | Throughout + Phase 8 |
| Documentation | 5 | Phase 9 |
| Agentic AI bonus | 5 | Phase 7 |
| **Total** | **100** | |

---

## 1. Tech Stack (final)

**Backend:** Node.js + Express (JavaScript), Joi (request validation), Axios + axios-retry (HTTP client), Opossum (circuit breaker), Pino (structured logging), better-sqlite3 (persistence), node-cron (health pings), Jest + Supertest (tests), swagger-jsdoc + swagger-ui-express (API docs).
Architecture follows **Routes → Controllers → Services** pattern for clean separation of concerns.

**Frontend:** React + Vite (JavaScript/JSX), Tailwind CSS v3, @tanstack/react-query (server-state management), Axios (HTTP client), Recharts (charts), React Router (navigation), React Hook Form (forms), Lucide React (icons).

**AI Agent:** Anthropic/OpenAI API call from a small `/agent/generate-config` endpoint.

---

## 2. Project Structure

```
vendor-router/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                    # environment variables & defaults
│   │   │   ├── constants.js              # app-wide constants (strategies enum, etc.)
│   │   │   └── database.js               # SQLite setup + migrations
│   │   ├── routes/
│   │   │   ├── vendor.routes.js          # /vendors endpoints
│   │   │   ├── routing.routes.js         # /route endpoint
│   │   │   ├── metrics.routes.js         # /vendor-metrics endpoint
│   │   │   ├── logs.routes.js            # /routing-logs endpoint
│   │   │   ├── health.routes.js          # /health endpoint
│   │   │   └── agent.routes.js           # /agent/* endpoints (AI bonus)
│   │   ├── controllers/
│   │   │   ├── vendor.controller.js      # parse req → call service → send res
│   │   │   ├── routing.controller.js
│   │   │   ├── metrics.controller.js
│   │   │   ├── logs.controller.js
│   │   │   ├── health.controller.js
│   │   │   └── agent.controller.js
│   │   ├── services/
│   │   │   ├── vendor.service.js         # business logic for vendor CRUD
│   │   │   ├── routing.service.js        # orchestrates strategy selection & execution
│   │   │   ├── metrics.service.js        # rolling-window metrics computation
│   │   │   ├── logs.service.js           # routing log persistence & queries
│   │   │   ├── health.service.js         # vendor health-check logic
│   │   │   └── agent.service.js          # LLM integration for config generation
│   │   ├── validators/
│   │   │   ├── vendor.validator.js       # Joi schemas for vendor payloads
│   │   │   ├── routing.validator.js      # Joi schemas for routing rule payloads
│   │   │   └── common.validator.js       # shared Joi helpers (pagination, etc.)
│   │   ├── strategies/                   # Strategy Pattern — one file per strategy
│   │   │   ├── priority.strategy.js
│   │   │   ├── weighted.strategy.js
│   │   │   ├── lowestLatency.strategy.js
│   │   │   ├── lowestCost.strategy.js
│   │   │   ├── failover.strategy.js
│   │   │   ├── roundRobin.strategy.js
│   │   │   ├── featureBased.strategy.js
│   │   │   └── healthBased.strategy.js
│   │   ├── core/
│   │   │   ├── router.engine.js          # selects strategy + executes call
│   │   │   ├── metrics.tracker.js        # rolling latency/success/error per vendor
│   │   │   ├── circuit.breaker.js        # wraps Opossum per vendor
│   │   │   └── vendor.client.js          # Axios wrapper w/ retry + timeout
│   │   ├── middleware/
│   │   │   ├── validate.js               # generic Joi validation middleware
│   │   │   ├── errorHandler.js           # central error handler
│   │   │   └── requestLogger.js          # Pino request logging
│   │   ├── mocks/                        # mock vendor servers for demo
│   │   │   ├── vendorA.mock.js
│   │   │   ├── vendorB.mock.js
│   │   │   └── vendorC.mock.js
│   │   ├── docs/
│   │   │   └── swagger.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── strategies/                   # unit tests per strategy
│   │   ├── controllers/                  # controller integration tests
│   │   └── integration/                  # full API integration tests
│   ├── sample-configs/
│   │   ├── vendors.json
│   │   ├── vendors-alt.json
│   │   ├── routing-rules.json
│   │   └── routing-rules-alt.json
│   ├── package.json
│   └── .eslintrc.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js            # Axios instance with base URL & interceptors
│   │   │   ├── vendorApi.js              # GET/POST /vendors
│   │   │   ├── routingApi.js             # POST /route
│   │   │   ├── metricsApi.js             # GET /vendor-metrics
│   │   │   └── logsApi.js               # GET /routing-logs
│   │   ├── hooks/
│   │   │   ├── useVendors.js             # TanStack Query hooks for vendors
│   │   │   ├── useRouting.js             # TanStack Query hooks for routing
│   │   │   ├── useMetrics.js             # TanStack Query hooks (auto-refetch 5s)
│   │   │   └── useLogs.js               # TanStack Query hooks for logs
│   │   ├── pages/
│   │   │   ├── VendorsPage.jsx
│   │   │   ├── RoutingRulesPage.jsx
│   │   │   ├── MetricsPage.jsx
│   │   │   ├── LogsPage.jsx
│   │   │   └── TryItPage.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx           # navigation with Lucide icons
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── vendors/
│   │   │   │   ├── VendorTable.jsx
│   │   │   │   └── VendorForm.jsx
│   │   │   ├── metrics/
│   │   │   │   ├── LatencyChart.jsx      # Recharts line/bar chart
│   │   │   │   ├── SuccessRateChart.jsx
│   │   │   │   └── MetricsCard.jsx
│   │   │   ├── logs/
│   │   │   │   └── LogsTable.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                     # Tailwind directives + custom styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── architecture-diagram.png
│   ├── ROUTING_DECISIONS.md
│   └── AI_USAGE.md
└── docker-compose.yml
```

### Backend Architecture Pattern

```
Request → Route → Middleware (validate) → Controller → Service → DB/Core
                                              ↓
                                          Response
```

- **Routes** (`routes/*.routes.js`) — Define HTTP endpoints, attach Joi validation middleware, delegate to controllers. No business logic here.
- **Controllers** (`controllers/*.controller.js`) — Parse the request, call the appropriate service method, format and send the response. Thin layer.
- **Services** (`services/*.service.js`) — All business logic lives here. Interact with the database, core modules (router engine, metrics tracker), and external APIs.
- **Validators** (`validators/*.validator.js`) — Joi schemas for request body/query/params validation, used by the `validate` middleware.

### Frontend Data-Fetching Pattern

```
Component → TanStack Query Hook → API function (Axios) → Backend
                  ↓
            Cache + Auto Refetch
```

- **API layer** (`api/*.js`) — Pure Axios calls returning data. No React dependencies.
- **Hooks** (`hooks/use*.js`) — TanStack Query `useQuery`/`useMutation` wrappers around API functions. Components import these, never call Axios directly.
- **Icons** — All icons from `lucide-react` (e.g., `Server`, `Activity`, `BarChart3`, `FileText`, `Zap`, `Shield`, `AlertTriangle`).

---

## 3. Phase-by-Phase Build Plan

### Phase 0 — Setup (30 min)
- Init backend (`npm init`, Express skeleton, Pino logger, error middleware, Joi).
- Init frontend (`npm create vite@latest ./ -- --template react`, install Tailwind CSS v3, @tanstack/react-query, axios, recharts, react-router-dom, react-hook-form, lucide-react).
- Spin up 3 mock vendor endpoints (Express apps or same server on different routes) simulating PAN verification with configurable artificial latency/failure rate so routing behavior is demonstrable.

### Phase 1 — Data Models (30 min)

Data models are defined as JSDoc typedefs (for IDE intellisense) and as Joi schemas (for runtime validation):

```js
/**
 * @typedef {Object} Vendor
 * @property {string} id
 * @property {string} name
 * @property {string} capability          - e.g. "PAN_VERIFICATION"
 * @property {string} endpoint
 * @property {number} [weight]
 * @property {number} costPerRequest
 * @property {number} timeoutMs
 * @property {number} rateLimitPerMinute
 * @property {number} priority
 * @property {string[]} supportedFeatures
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} RoutingRule
 * @property {string} capability
 * @property {'priority'|'weighted'|'lowest_latency'|'lowest_cost'
 *            |'failover'|'round_robin'|'feature_based'|'health_based'} strategy
 * @property {string[]} vendors            - vendor ids in scope
 * @property {{ maxLatencyMs?: number, maxErrorRate?: number }} thresholds
 */

/**
 * @typedef {Object} VendorMetrics
 * @property {string} vendorId
 * @property {number} avgLatencyMs
 * @property {number} successRate
 * @property {number} errorRate
 * @property {number} requestsLastMinute
 * @property {boolean} isHealthy
 * @property {string} lastCheckedAt
 */

/**
 * @typedef {Object} RoutingLog
 * @property {string} requestId
 * @property {string} capability
 * @property {string} vendorUsed
 * @property {string} routingReason
 * @property {number} latencyMs
 * @property {number} cost
 * @property {'SUCCESS'|'FAILURE'} status
 * @property {string} timestamp
 */
```

Persist `Vendor` and `RoutingRule` in SQLite; keep `VendorMetrics` in an in-memory rolling window (refreshed every request + periodic health-check cron), snapshotted to SQLite every N seconds so `/vendor-metrics` survives restarts.

### Phase 2 — Config & Rule Engine (Rule/config design — 15 marks)

**Backend pattern for every resource:**

```js
// routes/vendor.routes.js
const router = require('express').Router();
const { validateBody } = require('../middleware/validate');
const { createVendorSchema, updateVendorSchema } = require('../validators/vendor.validator');
const vendorController = require('../controllers/vendor.controller');

router.post('/', validateBody(createVendorSchema), vendorController.createVendor);
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', validateBody(updateVendorSchema), vendorController.updateVendor);

module.exports = router;
```

```js
// controllers/vendor.controller.js
const vendorService = require('../services/vendor.service');

exports.createVendor = async (req, res, next) => {
  try {
    const vendor = await vendorService.createVendor(req.body);
    res.status(201).json({ status: 'success', data: vendor });
  } catch (err) {
    next(err);
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await vendorService.getVendors(req.query);
    res.status(200).json({ status: 'success', data: vendors });
  } catch (err) {
    next(err);
  }
};
```

```js
// services/vendor.service.js
const db = require('../config/database');

exports.createVendor = (vendorData) => {
  // generate id, insert into SQLite, return created vendor
};

exports.getVendors = ({ capability } = {}) => {
  // query SQLite, optionally filter by capability
};
```

- Routing rule config accepted either inline in `POST /route` request or pre-registered via a `POST /routing-rules` convenience endpoint.
- Load sample configs from `sample-configs/*.json` on boot as seed data.
- Validate rule shape strictly (strategy enum, vendor references exist, thresholds numeric) — reject with a clear 400 and reason.

**Full-marks tips:** version the config schema (`schemaVersion: 1`), and validate at both API boundary and load time so bad config can never reach the router engine.

### Phase 3 — Routing Strategies (25 marks — the biggest bucket, implement all 8, not just 3)
Implement the Strategy Pattern: one class per strategy, all implementing `select(vendors, metrics, requirements): Vendor`.

| Strategy | Logic |
|---|---|
| Priority | Pick lowest `priority` number among healthy vendors |
| Weighted | Weighted-random selection using `weight` field |
| Lowest latency | Pick vendor with lowest `avgLatencyMs` from metrics |
| Lowest cost | Pick vendor with lowest `costPerRequest` meeting requirements |
| Failover | Try vendors in priority order; on failure/timeout, fall through to next |
| Round robin | Rotate through vendor list per capability using a counter |
| Feature based | Filter to vendors whose `supportedFeatures` includes the requested feature, then apply secondary strategy |
| Health based | Filter out vendors below health threshold (error rate/availability), then apply secondary strategy |

- `router.engine.js` picks the strategy class based on the rule's `strategy` field (open/closed — adding a 9th strategy needs no engine changes).
- Every selection produces a **human-readable `routingReason` string** (mandatory per sample output) — this is graded, so make reasons specific: `"VendorB selected because VendorA crossed latency threshold (2200ms > 2000ms limit)"`.

### Phase 4 — Failover & Resilience (15 marks)
- Wrap each vendor call in Opossum circuit breaker (open after N consecutive failures, half-open retry after cooldown).
- `vendor.client.js`: Axios with per-vendor `timeoutMs` + `axios-retry` (2 retries, exponential backoff) before declaring failure.
- On failure of the selected vendor, router engine automatically re-runs strategy excluding the failed vendor (cascading failover) and logs each attempt.
- Rate-limit enforcement: track requests/minute per vendor in memory; skip a vendor that has hit `rateLimitPerMinute`.
- All 5 auto-switch triggers from the spec must be demonstrably wired: vendor down, rate limit reached, latency threshold crossed, error rate high, feature unsupported.

### Phase 5 — Metrics Tracking (15 marks)
- `metrics.tracker.js`: maintain a rolling window (last 100 requests or last 5 minutes) per vendor computing avg latency, success rate, error rate.
- Background health-check cron (`node-cron`, every 15s) pings each vendor's `/health` (mock) and updates `isHealthy`.
- `GET /vendor-metrics` returns current snapshot for all vendors.
- `GET /routing-logs` returns paginated routing decisions (filter by capability/vendor/status/date).
- Persist logs to SQLite so they survive restarts and can be queried.

### Phase 6 — Mandatory APIs (10 marks — API design)
Implement exactly, with OpenAPI docs:
```
POST /vendors
GET  /vendors
POST /route
GET  /vendor-metrics
GET  /routing-logs
GET  /health
```
- Consistent response envelope: `{ status, data, error }`.
- Proper HTTP status codes (400 validation, 404 unknown vendor, 503 no healthy vendor available, 200/201 success).
- Swagger UI mounted at `/api-docs`.

**Each endpoint follows the Routes → Controllers → Services pattern consistently.**

### Phase 7 — Agentic AI Bonus (5 marks)
`POST /agent/generate-config`
- Input: plain English string (e.g. "Use Vendor A for 70% traffic, Vendor B for 30%, but switch to Vendor C if latency crosses 2 seconds or error rate is above 5%.")
- Controller delegates to `agent.service.js` which calls LLM with a system prompt that knows the exact `RoutingRule` JSON schema.
- Output: valid `RoutingRule` JSON, validated with the same Joi schema used at `POST /route`, before returning it — this guarantees the agent never emits broken config.
- Stretch: `POST /agent/explain-routing?requestId=...` — feeds a `RoutingLog` entry to the LLM and returns a plain-English explanation, directly answering "Explain why a vendor was selected."

### Phase 8 — Frontend Dashboard
Built with **React (JSX) + Tailwind CSS v3 + TanStack Query + Axios + Lucide React**.

- **Vendors** page: table (with Lucide `Server` icon) + form to add/edit vendors (React Hook Form).
- **Routing Rules** page: build a rule visually (strategy dropdown, vendor multi-select, threshold inputs).
- **Metrics** page: Recharts bar/line charts for latency, success rate, error rate per vendor, auto-refetching every 5s via TanStack Query's `refetchInterval`.
- **Logs** page: filterable table of routing decisions with the `routingReason`.
- **Try It** page: form to fire a `/route` test request and render the JSON response live — great for demoing to evaluators.

**Frontend code patterns:**

```jsx
// api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
```

```jsx
// hooks/useVendors.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendors, createVendor, updateVendor } from '../api/vendorApi';

export const useVendors = (filters) => {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => getVendors(filters),
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });
};
```

```jsx
// hooks/useMetrics.js
import { useQuery } from '@tanstack/react-query';
import { getMetrics } from '../api/metricsApi';

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: getMetrics,
    refetchInterval: 5000, // auto-refresh every 5 seconds
  });
};
```

```jsx
// Example component with Lucide icons
import { Server, Activity, BarChart3, FileText, Zap } from 'lucide-react';

function Sidebar() {
  return (
    <nav className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <NavItem icon={<Server size={20} />} label="Vendors" to="/vendors" />
      <NavItem icon={<Activity size={20} />} label="Metrics" to="/metrics" />
      <NavItem icon={<BarChart3 size={20} />} label="Routing Rules" to="/rules" />
      <NavItem icon={<FileText size={20} />} label="Logs" to="/logs" />
      <NavItem icon={<Zap size={20} />} label="Try It" to="/try-it" />
    </nav>
  );
}
```

### Phase 9 — Documentation & Deliverables (5 marks + required for overall grading)
Prepare every listed deliverable explicitly:

1. **README.md** — setup instructions, how to run backend/frontend/mocks, how to seed sample data, tech stack rationale.
2. **API_DOCUMENTATION.md** (or Swagger export) — every endpoint, request/response schema, error codes.
3. **sample-configs/** — at least 2 vendor JSON files + 2 routing-rule JSON files covering different strategies.
4. **Sample API requests/responses** — a `docs/examples.http` or Postman collection with real captured request/response pairs for each mandatory endpoint.
5. **ARCHITECTURE.md + architecture-diagram.png** — component diagram (Client → API Gateway/Express → Controller → Service → Router Engine → Strategy → Circuit Breaker → Vendor Client → Vendor A/B/C), plus data flow for a routed request.
6. **ROUTING_DECISIONS.md** — a short write-up per strategy explaining the algorithm and trade-offs (this directly targets "Explanation of routing decisions" as its own deliverable line item).
7. **AI_USAGE.md** — required since AI tools (including this conversation) assisted development: state which parts were AI-assisted (e.g., "boilerplate scaffolding, strategy pattern skeletons") vs. hand-written/reviewed, and describe the agent bonus feature implementation.

### Phase 10 — Code Quality Pass (10 marks)
- ESLint + Prettier configured and clean.
- Consistent error handling via central `errorHandler` middleware — no unhandled promise rejections.
- Unit tests: at least one test per strategy (pure function logic) + integration test for `POST /route` happy path and failover path.
- No dead code, meaningful commit history (commit per phase, not one giant commit) — evaluators often check git log.

---

## 4. Suggested Weekend Timeline

| Time block | Work |
|---|---|
| Sat AM (3h) | Phase 0–2: setup, models, config/rule engine, mock vendors |
| Sat PM (4h) | Phase 3: all 8 routing strategies + engine wiring |
| Sat Evening (2h) | Phase 4: circuit breaker, retries, rate limiting, failover |
| Sun AM (3h) | Phase 5–6: metrics tracker, logs, mandatory APIs, Swagger |
| Sun PM (3h) | Phase 8: React dashboard (Vendors, Metrics, Logs, Try It) |
| Sun Evening (2h) | Phase 7: AI agent endpoint + Phase 9: all docs |
| Buffer (1–2h) | Phase 10: tests, lint, README polish, record sample requests |

---

## 5. Full-Marks Checklist (tick before submission)

- [ ] All 6 mandatory APIs implemented and documented
- [ ] All 8 routing strategies implemented (not just the minimum 3)
- [ ] `routingReason` is specific and human-readable in every response
- [ ] Failover cascades automatically across all 5 documented trigger conditions
- [ ] Metrics update live and persist across restarts
- [ ] Config/rules are schema-validated with clear error messages
- [ ] Swagger/OpenAPI docs available at `/api-docs`
- [ ] Architecture diagram included
- [ ] Sample vendor configs + sample requests/responses included
- [ ] ROUTING_DECISIONS.md explains each strategy
- [ ] AI_USAGE.md included and honest
- [ ] Tests pass (`npm test`), lint clean
- [ ] React dashboard shows vendors, live metrics, logs, and a working "Try It" form
- [ ] Bonus AI agent generates valid config from plain English and/or explains a routing decision
- [ ] Backend follows Routes → Controllers → Services pattern consistently
- [ ] Frontend uses TanStack Query hooks for all data fetching (no raw Axios in components)
- [ ] All icons from Lucide React
- [ ] Tailwind CSS v3 utility classes used throughout (no inline styles)