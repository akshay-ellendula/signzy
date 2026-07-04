const { computeSuggestions } = require('../services/fallbackAdvisor');

const log = (capability, failoverHistory) => ({ capability, failoverHistory });

describe('computeSuggestions', () => {
  it('ranks vendors by reliability per capability, ignoring skipped entries', () => {
    const logs = [
      log('sms', [
        { vendor: 'A', status: 'timeout' },
        { vendor: 'B', status: 'success' },
      ]),
      log('sms', [
        { vendor: 'C', status: 'skipped' }, // never attempted - shouldn't count
        { vendor: 'A', status: 'success' },
      ]),
      log('sms', [{ vendor: 'A', status: 'success' }]),
    ];

    const [suggestion] = computeSuggestions(logs);

    expect(suggestion.capability).toBe('sms');
    // A: 2 success / 1 timeout out of 3 attempts = 66.7%. B: 1 success / 1 = 100%.
    expect(suggestion.suggestedOrder).toEqual(['B', 'A']);
    expect(suggestion.stats.find((s) => s.vendor === 'C')).toBeUndefined();
  });

  it('groups by capability separately', () => {
    const logs = [
      log('sms', [{ vendor: 'A', status: 'success' }]),
      log('email', [{ vendor: 'B', status: 'failure' }]),
    ];

    const suggestions = computeSuggestions(logs);
    const capabilities = suggestions.map((s) => s.capability).sort();
    expect(capabilities).toEqual(['email', 'sms']);
  });

  it('returns an empty array when there are no logs', () => {
    expect(computeSuggestions([])).toEqual([]);
  });
});
