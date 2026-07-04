// Ranks vendors with real latency data ascending by currentLatency. Vendors
// that have never handled a request (totalRequests === 0) default currentLatency
// to 0, which would otherwise make an untested vendor look infinitely fast -
// so they're kept separate and appended after every proven vendor instead.
const rank = (vendors) => {
  const tested = vendors.filter((v) => v.metrics.totalRequests > 0);
  const untested = vendors.filter((v) => v.metrics.totalRequests === 0);

  tested.sort((a, b) => a.currentLatency - b.currentLatency);

  return [...tested, ...untested];
};

module.exports = { rank };
