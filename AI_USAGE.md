# AI Usage Documentation

This document describes how AI tools were used during the development of the Intelligent Vendor Routing Platform, as required by the assignment deliverables.

## Tools Used

| Tool | Purpose | Where Used |
|------|---------|------------|
| **GitHub Copilot / Claude** | Code generation assistance, debugging, architecture review | Throughout server & client |
| **Google Gemini LLM** | Generating structured routing rules and plain-English routing explanations from logs | `server/services/agentService.js` |
| **ChatGPT** | Researching MongoDB patterns, Express best practices | Design phase |

## How AI Was Used

### 1. Architecture & Design
- AI was consulted to review the **Strategy Design Pattern** implementation for routing strategies, ensuring the `rank(vendors, context)` interface was clean and extensible.
- The **MVC folder structure** (controllers → services → models) was refined with AI suggestions for separation of concerns.
- Circuit breaker design (auto-marking vendors unhealthy, half-open recovery) was discussed with AI to choose between in-memory vs. database-persisted state.

### 2. Routing Engine
- The **failover loop** in `routingEngine.js` was developed iteratively with AI assistance — specifically the logic for retrying the next-best vendor from the ranked list when the current one fails or times out.
- The **sliding-window rate limiter** (`utils/rateLimiter.js`) was designed with AI help to avoid the fixed-window boundary leak problem, using MongoDB's atomic `$push` + `$expr` pattern.
- **Vendor filtering logic** (`utils/filterVendors.js`) was reviewed by AI to ensure all exclusion criteria (down, unhealthy, rate-limited, missing feature, high latency) were covered.

### 3. AI Rule Generator & Agentic Features
- A direct integration with the **Google Gemini API** (`@google/genai`) was developed to handle complex rule generation. Instead of falling back to fragile regex, the system strictly relies on the LLM to understand compound clauses like "switch to Vendor C if latency crosses 2 seconds **or** error rate is above 5%".
- AI was also used to implement the `explainRouting` capability, where the LLM reads a structured JSON audit log of a request's failover history and generates a friendly, plain-English summary for the dashboard.

### 4. Testing
- AI assisted in writing **Jest + Supertest integration tests** (`tests/api.test.js`), particularly the concurrent burst test for rate limiting which uses `Promise.all` to fire 6 simultaneous requests.
- Test patterns for **in-memory MongoDB** (`mongodb-memory-server`) were suggested by AI.

### 5. Frontend
- AI helped with **React component structure** and the dashboard layout using Tailwind CSS v4.
- Page-level data hooks (`useMetrics`, `useLogs`, `useHealth`) and the shared `AppContext` were structured with AI guidance to avoid prop-drilling and keep API calls centralized.

### 6. Debugging
- MongoDB connection issues (DNS SRV resolution failures on Windows) were diagnosed and resolved with AI help — the fix involved setting custom DNS servers (`dns.setServers(['8.8.8.8'])`) before the MongoDB driver attempts its SRV lookup.
- Mongoose validation errors leaking raw error messages to the client were identified by AI, leading to the centralized error normalizer in `middleware/errorHandler.js`.

## What Was NOT AI-Generated
- The **overall system architecture** and routing strategy selection were human decisions based on the assignment requirements.
- **Business logic decisions** (e.g., which metrics to track, what thresholds to use, how availability is computed) were made by the developer.
- **All code was reviewed, understood, and tested** by the developer before inclusion. AI suggestions were adapted and modified to fit the project's conventions and requirements.

## Ethical Considerations
- AI was used as a **productivity tool and pair programmer**, not as a replacement for understanding the code.
- Every AI-generated suggestion was critically evaluated, tested, and often modified before being committed.
- The developer maintains full understanding of all code in the repository.
