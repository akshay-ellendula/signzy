// Higher `priority` value is tried first.
const rank = (vendors) => {
  return [...vendors].sort((a, b) => b.priority - a.priority);
};

module.exports = { rank };
