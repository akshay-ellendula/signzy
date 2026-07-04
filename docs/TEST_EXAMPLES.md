# Test Examples & Sample Payloads

This guide provides ready-to-use payloads and natural language prompts for testing the Intelligent Vendor Routing Platform directly through the web dashboard.

---

## 1. AI Rule Generator Prompts

Copy and paste these natural language sentences into the **"AI Rule Generator"** tab on the dashboard to see how Google Gemini converts plain English instructions into structured JSON routing rules:

### Example A: Weighted Split with Failover Condition
> *"Use Vendor A for 80% of traffic and Vendor B for 20%, but switch to Vendor C if latency exceeds 2 seconds."*

### Example B: Lowest Cost with Error Rate Condition
> *"Route all my traffic using the lowestCost strategy. If the error rate exceeds 5%, switch to Vendor C."*

### Example C: Priority Routing with Capability Filter
> *"Use priority routing. Vendor A is top priority, followed by Vendor B. Only use vendors that support PAN_VERIFICATION."*

---

## 2. Route Tester Payloads

Copy and paste these JSON objects into the **"Payload"** box on the **"Route Tester"** page to simulate live API traffic through the routing engine:

### Payload A: PAN Verification Request
```json
{
  "customerId": "cust_9921",
  "capability": "PAN_VERIFICATION",
  "data": {
    "panNumber": "ABCDE1234F",
    "name": "Rahul Sharma"
  }
}
```
*Tip: Try testing this with `strategy` set to **lowestCost** vs **lowestLatency** to see how different vendors are selected based on real-time simulated metrics.*

---

### Payload B: OCR Document Extraction
```json
{
  "customerId": "cust_1122",
  "capability": "OCR",
  "data": {
    "imageUrl": "https://example.com/id-card.jpg",
    "documentType": "PASSPORT"
  }
}
```

---

### Payload C: SMS Notification
```json
{
  "customerId": "cust_3344",
  "capability": "SMS",
  "data": {
    "phoneNumber": "+919876543210",
    "message": "Your verification code is 482913"
  }
}
```

---

### Payload D: Document Validation
```json
{
  "customerId": "cust_5566",
  "capability": "DOCUMENT_VALIDATION",
  "data": {
    "documentUrl": "https://example.com/contract.pdf",
    "documentType": "CONTRACT"
  }
}
```
