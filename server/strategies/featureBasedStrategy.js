// Feature-based routing: every candidate here already supports the requested
// capability (filterVendors excludes anyone who doesn't, before ranking even
// starts) - so this ranks by breadth of *additional* supported features,
// preferring the more versatile/complete vendor as a tiebreak.
const rank = (vendors) => {
  return [...vendors].sort((a, b) => b.supportedFeatures.length - a.supportedFeatures.length);
};

module.exports = { rank };
