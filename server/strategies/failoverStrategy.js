// Failover routing: try the primary (highest-priority) vendor, then fail over
// down the same priority-ordered chain if it doesn't succeed. The actual
// failover *behavior* (retrying the next vendor on failure) is built into the
// routing engine for every strategy - this one just defines what "the chain"
// looks like: strict priority order, so there's always one unambiguous primary.
const rank = (vendors) => {
  return [...vendors].sort((a, b) => b.priority - a.priority);
};

module.exports = { rank };
