const { isRateLimited } = require('../utils/rateLimiter');
const { config } = require('../config/constants');

const vendor = (overrides) => ({ rateLimitPerMinute: 3, requestTimestamps: [], ...overrides });

describe('isRateLimited (sliding window)', () => {
  it('is not rate limited when there are no recent requests', () => {
    expect(isRateLimited(vendor())).toBe(false);
  });

  it('is rate limited once recent requests reach the limit', () => {
    const now = Date.now();
    expect(isRateLimited(vendor({ requestTimestamps: [now, now, now] }))).toBe(true);
  });

  it('ignores timestamps older than the window no matter how many there are - this is the fix: a fixed window would reset these to 0 and let a fresh burst through, but stale entries here never count at all', () => {
    const longAgo = Date.now() - (config.RATE_LIMIT_WINDOW_MS + 5000);
    const v = vendor({ requestTimestamps: [longAgo, longAgo, longAgo, longAgo, longAgo] });
    expect(isRateLimited(v)).toBe(false);
  });

  it('counts only timestamps within the trailing window when old and new are mixed', () => {
    const now = Date.now();
    const longAgo = now - (config.RATE_LIMIT_WINDOW_MS + 5000);
    const v = vendor({ rateLimitPerMinute: 3, requestTimestamps: [longAgo, longAgo, now, now] });
    expect(isRateLimited(v)).toBe(false); // only 2 recent, limit is 3

    v.requestTimestamps.push(now);
    expect(isRateLimited(v)).toBe(true); // now 3 recent, limit is 3
  });
});
