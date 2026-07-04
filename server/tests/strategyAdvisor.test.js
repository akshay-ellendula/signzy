const { computeRecommendation } = require('../services/strategyAdvisor');

const vendor = (overrides) => ({
  name: 'Vendor',
  isActive: true,
  healthStatus: 'healthy',
  weight: 1,
  costPerRequest: 0.1,
  currentLatency: 500,
  metrics: { totalRequests: 10, successRate: 100, errorRate: 0 },
  ...overrides,
});

describe('computeRecommendation', () => {
  it('recommends roundRobin when there is no vendor data at all', () => {
    const result = computeRecommendation([]);
    expect(result.recommendedStrategy).toBeNull();
  });

  it('falls back to roundRobin when there is not enough traffic yet', () => {
    const vendors = [vendor({ metrics: { totalRequests: 1, successRate: 100, errorRate: 0 } })];
    const result = computeRecommendation(vendors);
    expect(result.recommendedStrategy).toBe('roundRobin');
  });

  it('recommends weighted when weights differ a lot and traffic is still low', () => {
    const vendors = [
      vendor({ name: 'A', weight: 10, metrics: { totalRequests: 1, successRate: 100, errorRate: 0 } }),
      vendor({ name: 'B', weight: 1, metrics: { totalRequests: 1, successRate: 100, errorRate: 0 } }),
    ];
    const result = computeRecommendation(vendors);
    expect(result.recommendedStrategy).toBe('weighted');
  });

  it('recommends healthBased when reliability varies significantly with enough traffic', () => {
    const vendors = [
      vendor({ name: 'A', metrics: { totalRequests: 20, successRate: 95, errorRate: 5 } }),
      vendor({ name: 'B', metrics: { totalRequests: 20, successRate: 40, errorRate: 60 } }),
    ];
    const result = computeRecommendation(vendors);
    expect(result.recommendedStrategy).toBe('healthBased');
  });

  it('recommends lowestLatency when latency varies significantly but health is comparable', () => {
    const vendors = [
      vendor({ name: 'Fast', currentLatency: 100, metrics: { totalRequests: 20, successRate: 100, errorRate: 0 } }),
      vendor({ name: 'Slow', currentLatency: 2000, metrics: { totalRequests: 20, successRate: 100, errorRate: 0 } }),
    ];
    const result = computeRecommendation(vendors);
    expect(result.recommendedStrategy).toBe('lowestLatency');
  });

  it('recommends lowestCost when cost varies significantly but latency/health are comparable', () => {
    const vendors = [
      vendor({ name: 'Cheap', costPerRequest: 0.01, currentLatency: 500, metrics: { totalRequests: 20, successRate: 100, errorRate: 0 } }),
      vendor({ name: 'Pricey', costPerRequest: 0.5, currentLatency: 520, metrics: { totalRequests: 20, successRate: 100, errorRate: 0 } }),
    ];
    const result = computeRecommendation(vendors);
    expect(result.recommendedStrategy).toBe('lowestCost');
  });

  it('recommends roundRobin when vendors are comparable across the board', () => {
    const vendors = [
      vendor({ name: 'A', currentLatency: 500, costPerRequest: 0.1, metrics: { totalRequests: 20, successRate: 95, errorRate: 5 } }),
      vendor({ name: 'B', currentLatency: 520, costPerRequest: 0.11, metrics: { totalRequests: 20, successRate: 93, errorRate: 7 } }),
    ];
    const result = computeRecommendation(vendors);
    expect(result.recommendedStrategy).toBe('roundRobin');
  });
});
