// Builds a capability-specific simulated vendor response on a successful call.
// Each capability gets its own realistic payload/response shape - e.g.
// PAN_VERIFICATION returns { panStatus, nameMatch } exactly like the brief's
// sample output, rather than one generic envelope for every capability.
// Unknown/custom capabilities fall back to a generic echo shape.
const randomId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const pick = (options, successBias = 0.85) => (Math.random() < successBias ? options[0] : options[1]);

const RESPONSE_BUILDERS = {
  PAN_VERIFICATION: (payload) => ({
    panStatus: pick(['VALID', 'INVALID']),
    nameMatch: Math.random() < 0.85,
    pan: payload?.pan ?? null,
  }),

  OCR: (payload) => ({
    extractedText: 'M/S ACME TRADING CO. | INVOICE #4821 | AMOUNT: 12,450.00',
    confidence: Number((0.8 + Math.random() * 0.19).toFixed(2)),
    fieldsDetected: {
      documentType: payload?.documentType ?? 'UNKNOWN',
      pageCount: 1,
    },
  }),

  SMS: (payload) => ({
    messageId: randomId('sms'),
    deliveryStatus: pick(['DELIVERED', 'UNDELIVERED']),
    to: payload?.to ?? null,
    deliveredAt: new Date().toISOString(),
  }),

  PAYMENT_PROCESSING: (payload) => ({
    transactionId: randomId('txn'),
    paymentStatus: pick(['CAPTURED', 'DECLINED']),
    amountCharged: payload?.amount ?? null,
    currency: payload?.currency ?? 'INR',
  }),

  DOCUMENT_VALIDATION: (payload) => ({
    validationStatus: pick(['VALID', 'INVALID']),
    documentType: payload?.documentType ?? 'UNKNOWN',
    issuesFound: [],
  }),
};

const buildCapabilityResponse = (capability, vendorName, payload) => {
  const builder = RESPONSE_BUILDERS[capability];
  if (builder) return builder(payload || {});
  return { message: `Request processed by ${vendorName}`, payload };
};

module.exports = { buildCapabilityResponse };
