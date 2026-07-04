const { buildCapabilityResponse } = require('../utils/capabilityResponses');

describe('buildCapabilityResponse', () => {
  it('PAN_VERIFICATION returns the exact shape from the brief: { panStatus, nameMatch }', () => {
    const response = buildCapabilityResponse('PAN_VERIFICATION', 'VendorB', { pan: 'ABCDE1234F', name: 'Rahul Sharma' });
    expect(response).toHaveProperty('panStatus');
    expect(['VALID', 'INVALID']).toContain(response.panStatus);
    expect(typeof response.nameMatch).toBe('boolean');
    expect(response.pan).toBe('ABCDE1234F');
  });

  it('OCR returns extracted-text fields, not the PAN shape', () => {
    const response = buildCapabilityResponse('OCR', 'VendorA', { documentType: 'INVOICE' });
    expect(response).toHaveProperty('extractedText');
    expect(response).toHaveProperty('confidence');
    expect(response).not.toHaveProperty('panStatus');
  });

  it('SMS returns a delivery receipt shape', () => {
    const response = buildCapabilityResponse('SMS', 'VendorA', { to: '+919876543210', message: 'OTP 123456' });
    expect(response).toHaveProperty('messageId');
    expect(['DELIVERED', 'UNDELIVERED']).toContain(response.deliveryStatus);
    expect(response.to).toBe('+919876543210');
  });

  it('PAYMENT_PROCESSING returns a transaction shape', () => {
    const response = buildCapabilityResponse('PAYMENT_PROCESSING', 'VendorC', { amount: 999, currency: 'INR' });
    expect(response).toHaveProperty('transactionId');
    expect(['CAPTURED', 'DECLINED']).toContain(response.paymentStatus);
    expect(response.amountCharged).toBe(999);
  });

  it('DOCUMENT_VALIDATION returns a validation shape', () => {
    const response = buildCapabilityResponse('DOCUMENT_VALIDATION', 'VendorB', { documentType: 'CONTRACT' });
    expect(['VALID', 'INVALID']).toContain(response.validationStatus);
    expect(response.documentType).toBe('CONTRACT');
  });

  it('falls back to a generic echo shape for an unrecognized capability', () => {
    const response = buildCapabilityResponse('SOMETHING_CUSTOM', 'VendorA', { foo: 'bar' });
    expect(response).toEqual({ message: 'Request processed by VendorA', payload: { foo: 'bar' } });
  });
});
