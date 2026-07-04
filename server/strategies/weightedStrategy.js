// Weighted random ordering: vendors with a higher `weight` are more likely to
// be picked first, but every vendor still gets a chance (useful for failover).
const rank = (vendors) => {
  const pool = [...vendors];
  const ordered = [];

  while (pool.length) {
    const totalWeight = pool.reduce((sum, v) => sum + Math.max(v.weight, 0.0001), 0);
    let roll = Math.random() * totalWeight;

    let chosenIndex = pool.length - 1;
    for (let i = 0; i < pool.length; i += 1) {
      roll -= Math.max(pool[i].weight, 0.0001);
      if (roll <= 0) {
        chosenIndex = i;
        break;
      }
    }

    ordered.push(pool[chosenIndex]);
    pool.splice(chosenIndex, 1);
  }

  return ordered;
};

module.exports = { rank };
