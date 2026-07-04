const RoutingLog = require('../models/RoutingLog');

const LOG_SAMPLE_SIZE = 200;

// Pure aggregation logic, kept separate from the DB fetch so it's trivially
// unit testable: given a batch of routing logs, work out - per capability -
// which vendors have actually proven reliable and which haven't, from their
// real failoverHistory outcomes (skipped entries don't count; they were never
// attempted).
const computeSuggestions = (logs) => {
  const byCapability = {};

  for (const log of logs) {
    const capability = log.capability || 'any';
    if (!byCapability[capability]) byCapability[capability] = {};
    const bucket = byCapability[capability];

    for (const entry of log.failoverHistory) {
      if (entry.status === 'skipped') continue;
      if (!bucket[entry.vendor]) bucket[entry.vendor] = { success: 0, failure: 0, timeout: 0 };
      if (entry.status === 'success') bucket[entry.vendor].success += 1;
      else if (entry.status === 'timeout') bucket[entry.vendor].timeout += 1;
      else bucket[entry.vendor].failure += 1;
    }
  }

  return Object.entries(byCapability).map(([capability, vendors]) => {
    const ranked = Object.entries(vendors)
      .map(([name, stats]) => {
        const attempts = stats.success + stats.failure + stats.timeout;
        const reliability = attempts > 0 ? Number(((stats.success / attempts) * 100).toFixed(1)) : 0;
        return { vendor: name, attempts, reliability, ...stats };
      })
      .sort((a, b) => b.reliability - a.reliability || b.attempts - a.attempts);

    const reason =
      ranked.length > 0
        ? `Based on the last ${LOG_SAMPLE_SIZE} routing decisions: ${ranked
            .map((r) => `${r.vendor} (${r.reliability}% reliable over ${r.attempts} attempt${r.attempts === 1 ? '' : 's'})`)
            .join(', ')}.`
        : 'No real vendor attempts recorded yet for this capability.';

    return { capability, suggestedOrder: ranked.map((r) => r.vendor), reason, stats: ranked };
  });
};

const suggestFallbackRules = async () => {
  const logs = await RoutingLog.find().sort({ timestamp: -1 }).limit(LOG_SAMPLE_SIZE);
  return computeSuggestions(logs);
};

module.exports = { suggestFallbackRules, computeSuggestions };
