const priorityStrategy = require('../strategies/priorityStrategy');
const weightedStrategy = require('../strategies/weightedStrategy');
const roundRobinStrategy = require('../strategies/roundRobinStrategy');
const lowestLatencyStrategy = require('../strategies/lowestLatencyStrategy');
const lowestCostStrategy = require('../strategies/lowestCostStrategy');
const healthBasedStrategy = require('../strategies/healthBasedStrategy');
const failoverStrategy = require('../strategies/failoverStrategy');
const featureBasedStrategy = require('../strategies/featureBasedStrategy');

const vendor = (overrides) => ({
  _id: '000000000000000000000000',
  name: 'Vendor',
  priority: 1,
  weight: 1,
  costPerRequest: 0,
  currentLatency: 0,
  isActive: true,
  healthStatus: 'healthy',
  supportedFeatures: [],
  metrics: { totalRequests: 0, successRate: 100, errorRate: 0, timesConsidered: 0, timesUnavailable: 0 },
  ...overrides,
});

describe('priorityStrategy', () => {
  it('sorts descending by priority', () => {
    const vendors = [vendor({ name: 'A', priority: 3 }), vendor({ name: 'B', priority: 5 }), vendor({ name: 'C', priority: 1 })];
    expect(priorityStrategy.rank(vendors).map((v) => v.name)).toEqual(['B', 'A', 'C']);
  });
});

describe('weightedStrategy', () => {
  it('produces a deterministic order when Math.random is fixed', () => {
    const vendors = [vendor({ name: 'A', weight: 1 }), vendor({ name: 'B', weight: 2 }), vendor({ name: 'C', weight: 3 })];
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(weightedStrategy.rank(vendors).map((v) => v.name)).toEqual(['B', 'C', 'A']);
    spy.mockRestore();
  });
});

describe('lowestLatencyStrategy', () => {
  it('ranks proven vendors by latency and pushes untested vendors (0ms default) to the end', () => {
    const vendors = [
      vendor({ name: 'Untested', currentLatency: 0, metrics: { totalRequests: 0, successRate: 100, errorRate: 0 } }),
      vendor({ name: 'Slow', currentLatency: 500, metrics: { totalRequests: 5, successRate: 100, errorRate: 0 } }),
      vendor({ name: 'Fast', currentLatency: 200, metrics: { totalRequests: 3, successRate: 100, errorRate: 0 } }),
    ];
    expect(lowestLatencyStrategy.rank(vendors).map((v) => v.name)).toEqual(['Fast', 'Slow', 'Untested']);
  });
});

describe('lowestCostStrategy', () => {
  it('sorts ascending by cost per request', () => {
    const vendors = [vendor({ name: 'A', costPerRequest: 0.2 }), vendor({ name: 'B', costPerRequest: 0.05 })];
    expect(lowestCostStrategy.rank(vendors).map((v) => v.name)).toEqual(['B', 'A']);
  });
});

describe('healthBasedStrategy', () => {
  it('is not purely a function of successRate once availability is independent', () => {
    // Equal successRate/errorRate, different availability history - if the
    // score were still just "successRate - 10" this would tie; it must not.
    const vendors = [
      vendor({
        name: 'LowAvailability',
        metrics: { totalRequests: 10, successRate: 80, errorRate: 20, timesConsidered: 10, timesUnavailable: 4 }, // 60% avail
      }),
      vendor({
        name: 'HighAvailability',
        metrics: { totalRequests: 10, successRate: 80, errorRate: 20, timesConsidered: 10, timesUnavailable: 1 }, // 90% avail
      }),
    ];
    expect(healthBasedStrategy.rank(vendors).map((v) => v.name)).toEqual(['HighAvailability', 'LowAvailability']);
  });
});

describe('roundRobinStrategy', () => {
  it('rotates by stable vendor identity even when the eligible set shrinks and grows between calls', () => {
    const a = vendor({ _id: '1', name: 'A' });
    const b = vendor({ _id: '2', name: 'B' });
    const c = vendor({ _id: '3', name: 'C' });
    const ctx = { capability: 'round-robin-stability-test' };

    const first = roundRobinStrategy.rank([a, b, c], ctx);
    expect(first[0].name).toBe('A');

    // A becomes ineligible for this call - B/C should still rotate correctly
    // relative to A's id, not restart from index 0.
    const second = roundRobinStrategy.rank([b, c], ctx);
    expect(second[0].name).toBe('B');

    // All three eligible again - rotation should continue past B, not reset.
    const third = roundRobinStrategy.rank([a, b, c], ctx);
    expect(third[0].name).toBe('C');
  });
});

describe('failoverStrategy', () => {
  it('orders vendors by priority, establishing the primary-then-failover chain', () => {
    const vendors = [vendor({ name: 'A', priority: 2 }), vendor({ name: 'B', priority: 5 }), vendor({ name: 'C', priority: 1 })];
    expect(failoverStrategy.rank(vendors).map((v) => v.name)).toEqual(['B', 'A', 'C']);
  });
});

describe('featureBasedStrategy', () => {
  it('ranks vendors by breadth of supported features, descending', () => {
    const vendors = [
      vendor({ name: 'Narrow', supportedFeatures: ['OCR'] }),
      vendor({ name: 'Broad', supportedFeatures: ['OCR', 'PAN_VERIFICATION', 'DOCUMENT_VALIDATION'] }),
      vendor({ name: 'Mid', supportedFeatures: ['OCR', 'PAN_VERIFICATION'] }),
    ];
    expect(featureBasedStrategy.rank(vendors).map((v) => v.name)).toEqual(['Broad', 'Mid', 'Narrow']);
  });
});
