const { generateRoutingConfig } = require('../utils/aiRuleGenerator');

describe('AI Rule Generator Regex Fallback', () => {
  it('parses the example text', () => {
    const text = 'Use Vendor A for 70% traffic and Vendor B for 30%, but switch to Vendor C if latency exceeds 2 seconds.';
    const result = generateRoutingConfig(text);
    
    expect(result.strategy).toBe('weighted');
    expect(result.weights).toHaveLength(2);
    expect(result.weights[0].vendor).toMatch(/Vendor A/i);
    expect(result.weights[0].percentage).toBe(70);
    expect(result.conditions).toHaveLength(1);
    expect(result.conditions[0].vendor).toMatch(/Vendor C/i);
    expect(result.conditions[0].value).toBe(2000);
  });
});
