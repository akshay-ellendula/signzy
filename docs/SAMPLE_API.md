# Sample API Requests & Responses

All examples use `http://localhost:5000` as the base URL.

---

## 1. POST /vendors — Register a Vendor

**Request:**
```bash
curl -X POST http://localhost:5000/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendor A",
    "priority": 1,
    "weight": 70,
    "costPerRequest": 1.50,
    "timeoutMs": 2000,
    "rateLimitPerMinute": 100,
    "supportedFeatures": ["PAN_VERIFICATION", "OCR"]
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "6847e3c71a2b3f001e4a1234",
    "name": "Vendor A",
    "priority": 1,
    "weight": 70,
    "costPerRequest": 1.5,
    "timeoutMs": 2000,
    "rateLimitPerMinute": 100,
    "supportedFeatures": ["PAN_VERIFICATION", "OCR"],
    "isActive": true,
    "healthStatus": "healthy",
    "currentLatency": 0,
    "metrics": {
      "totalRequests": 0,
      "successfulRequests": 0,
      "failedRequests": 0,
      "averageLatency": 0,
      "errorRate": 0,
      "successRate": 100,
      "availabilityPercentage": 100
    }
  }
}
```

---

## 2. GET /vendors — List All Vendors

**Request:**
```bash
curl http://localhost:5000/vendors
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6847e3c71a2b3f001e4a1234",
      "name": "Vendor A",
      "priority": 1,
      "weight": 70,
      "costPerRequest": 1.5,
      "timeoutMs": 2000,
      "rateLimitPerMinute": 100,
      "supportedFeatures": ["PAN_VERIFICATION", "OCR"],
      "isActive": true,
      "healthStatus": "healthy"
    },
    {
      "_id": "6847e3c71a2b3f001e4a5678",
      "name": "Vendor B",
      "priority": 2,
      "weight": 30,
      "costPerRequest": 0.8,
      "timeoutMs": 3000,
      "rateLimitPerMinute": 50,
      "supportedFeatures": ["PAN_VERIFICATION", "DOCUMENT_VALIDATION"],
      "isActive": true,
      "healthStatus": "healthy"
    }
  ]
}
```

---

## 3. POST /route — Route a Request (Sample Input from Assignment)

**Request (matches the assignment's sample input exactly):**
```bash
curl -X POST http://localhost:5000/route \
  -H "Content-Type: application/json" \
  -d '{
    "capability": "PAN_VERIFICATION",
    "payload": {
      "pan": "ABCDE1234F",
      "name": "Rahul Sharma"
    },
    "requirements": {
      "maxLatencyMs": 2000,
      "preferLowCost": true
    }
  }'
```

**Response (matches the assignment's sample output format):**
```json
{
  "success": true,
  "status": "SUCCESS",
  "vendorUsed": "Vendor B",
  "routingReason": "Lowest cost per request (₹0.8) among eligible vendors",
  "latencyMs": 850,
  "cost": 0.8,
  "response": {
    "panStatus": "VALID",
    "nameMatch": true,
    "pan": "ABCDE1234F"
  },
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "failoverHistory": [
    {
      "vendor": "Vendor B",
      "reason": "Vendor processed the request successfully",
      "latencyMs": 850,
      "status": "success"
    }
  ]
}
```

---

## 4. POST /route — With Failover (Vendor A fails, falls back to B)

**Request:**
```bash
curl -X POST http://localhost:5000/route \
  -H "Content-Type: application/json" \
  -d '{
    "capability": "PAN_VERIFICATION",
    "strategy": "priority",
    "payload": { "pan": "XYZAB5678K", "name": "Test User" }
  }'
```

**Response (failover occurred):**
```json
{
  "success": true,
  "status": "SUCCESS",
  "vendorUsed": "Vendor B",
  "routingReason": "Highest priority (priority=2) among eligible vendors",
  "latencyMs": 920,
  "cost": 0.8,
  "response": {
    "panStatus": "VALID",
    "nameMatch": true,
    "pan": "XYZAB5678K"
  },
  "requestId": "a2b3c4d5-e6f7-8901-abcd-ef2345678901",
  "failoverHistory": [
    {
      "vendor": "Vendor A",
      "reason": "Vendor returned an error (simulated failure)",
      "latencyMs": 350,
      "status": "failure"
    },
    {
      "vendor": "Vendor B",
      "reason": "Vendor processed the request successfully",
      "latencyMs": 920,
      "status": "success"
    }
  ]
}
```

---

## 5. POST /route — With Explicit Strategy and Conditions

**Request:**
```bash
curl -X POST http://localhost:5000/route \
  -H "Content-Type: application/json" \
  -d '{
    "capability": "PAN_VERIFICATION",
    "strategy": "weighted",
    "payload": { "pan": "ABCDE1234F", "name": "Rahul Sharma" },
    "conditions": [
      { "metric": "latency", "operator": ">", "value": 2000, "vendor": "Vendor C" },
      { "metric": "errorRate", "operator": ">", "value": 5, "vendor": "Vendor C" }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "status": "SUCCESS",
  "vendorUsed": "Vendor A",
  "routingReason": "Selected via weighted random selection (weight=70)",
  "latencyMs": 420,
  "cost": 1.5,
  "response": {
    "panStatus": "VALID",
    "nameMatch": true,
    "pan": "ABCDE1234F"
  },
  "requestId": "b3c4d5e6-f7a8-9012-bcde-f34567890123",
  "failoverHistory": [
    {
      "vendor": "Vendor A",
      "reason": "Vendor processed the request successfully",
      "latencyMs": 420,
      "status": "success"
    }
  ]
}
```

---

## 6. GET /vendor-metrics — Vendor Performance Metrics

**Request:**
```bash
curl http://localhost:5000/vendor-metrics
```

**Response (200 OK):**
```json
{
  "success": true,
  "summary": {
    "totalVendors": 3,
    "healthyVendors": 3,
    "totalRequests": 15,
    "successRate": 73.33,
    "averageLatency": 1250
  },
  "vendors": [
    {
      "_id": "6847e3c71a2b3f001e4a1234",
      "name": "Vendor A",
      "healthStatus": "healthy",
      "isActive": true,
      "currentLatency": 890,
      "metrics": {
        "totalRequests": 8,
        "successfulRequests": 6,
        "failedRequests": 2,
        "averageLatency": 1100,
        "errorRate": 25,
        "successRate": 75,
        "availabilityPercentage": 92.5,
        "lastUsedTime": "2026-07-04T12:30:00.000Z"
      }
    }
  ]
}
```

---

## 7. GET /routing-logs — Routing Decision Logs

**Request:**
```bash
curl "http://localhost:5000/routing-logs?page=1&limit=5&strategy=weighted&status=SUCCESS"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6847f1a01a2b3f001e4a9999",
      "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "timestamp": "2026-07-04T12:30:00.000Z",
      "capability": "PAN_VERIFICATION",
      "selectedVendor": "Vendor A",
      "routingStrategy": "weighted",
      "routingReason": "Selected via weighted random selection (weight=70)",
      "failoverHistory": [
        {
          "vendor": "Vendor A",
          "reason": "Vendor processed the request successfully",
          "latencyMs": 420,
          "status": "success"
        }
      ],
      "latencyMs": 420,
      "finalStatus": "SUCCESS"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 5,
    "totalPages": 3
  }
}
```

---

## 8. GET /health — System Health Check

**Request:**
```bash
curl http://localhost:5000/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "server": "ok",
  "database": "connected",
  "timestamp": "2026-07-04T12:30:00.000Z",
  "vendors": [
    {
      "name": "Vendor A",
      "isActive": true,
      "healthStatus": "healthy",
      "currentLatency": 890,
      "successRate": 75,
      "availabilityPercentage": 92.5
    },
    {
      "name": "Vendor B",
      "isActive": true,
      "healthStatus": "healthy",
      "currentLatency": 450,
      "successRate": 85,
      "availabilityPercentage": 97.2
    }
  ]
}
```

---

## 9. POST /ai-rule-generator — Generate Config from Plain English

**Request:**
```bash
curl -X POST http://localhost:5000/ai-rule-generator \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Use Vendor A for 70% traffic, Vendor B for 30%, but switch to Vendor C if latency crosses 2 seconds or error rate is above 5%."
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "strategy": "weighted",
    "vendorOrder": ["Vendor A", "Vendor B"],
    "weights": [
      { "vendor": "Vendor A", "percentage": 70 },
      { "vendor": "Vendor B", "percentage": 30 }
    ],
    "conditions": [
      { "metric": "latency", "operator": ">", "value": 2000, "unit": "ms", "action": "switchTo", "vendor": "Vendor C" },
      { "metric": "errorRate", "operator": ">", "value": 5, "unit": "%", "action": "switchTo", "vendor": "Vendor C" }
    ],
    "sourceText": "Use Vendor A for 70% traffic, Vendor B for 30%, but switch to Vendor C if latency crosses 2 seconds or error rate is above 5%."
  }
}
```

---

## 10. GET /strategy-recommendation — AI Strategy Advice

**Request:**
```bash
curl http://localhost:5000/strategy-recommendation
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendedStrategy": "lowestCost",
    "reason": "Vendors show a significant cost spread (87.5%). Routing by lowest cost would save money while all vendors remain healthy.",
    "signals": {
      "vendorsAnalyzed": 3,
      "totalRequests": 15,
      "latencySpreadPct": 42,
      "costSpreadPct": 87.5,
      "healthSpreadPct": 0
    }
  }
}
```

---

## 11. GET /fallback-suggestions — AI Fallback Advice

**Request:**
```bash
curl http://localhost:5000/fallback-suggestions
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "capability": "PAN_VERIFICATION",
      "suggestedOrder": ["Vendor B", "Vendor A"],
      "reason": "Vendor B has the highest success rate (85%) for PAN_VERIFICATION. Vendor A is a reliable fallback with 75% success rate."
    },
    {
      "capability": "OCR",
      "suggestedOrder": ["Vendor A", "Vendor C"],
      "reason": "Vendor A has the best success rate for OCR requests."
    }
  ]
}
```
