const rank = (vendors) => {
  return [...vendors].sort((a, b) => a.costPerRequest - b.costPerRequest);
};

module.exports = { rank };
