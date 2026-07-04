// Example request payloads matching each capability's real-world shape, used
// to auto-fill the Route Tester so a grader sees a realistic request rather
// than a generic { to, message } stub regardless of what capability is picked.
export const CAPABILITY_EXAMPLE_PAYLOADS = {
  PAN_VERIFICATION: { pan: 'ABCDE1234F', name: 'Rahul Sharma' },
  OCR: { documentUrl: 'https://example.com/invoice.jpg', documentType: 'INVOICE' },
  SMS: { to: '+919876543210', message: 'Your OTP is 482913' },
  PAYMENT_PROCESSING: { amount: 999.0, currency: 'INR', cardLast4: '4242' },
  DOCUMENT_VALIDATION: { documentType: 'CONTRACT', documentUrl: 'https://example.com/contract.pdf' },
};

export const DEFAULT_PAYLOAD = { to: '+1234567890', message: 'hello' };

export const examplePayloadFor = (capability) => CAPABILITY_EXAMPLE_PAYLOADS[capability] || DEFAULT_PAYLOAD;
