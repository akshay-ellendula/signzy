const extractWeights = (text) => {
  const weights = [];
  const regex = /(Vendor\s+[a-zA-Z0-9]+)[\s\w]+?(\d+)%/ig;
  let match;
  while ((match = regex.exec(text)) !== null) {
    weights.push({ vendor: match[1], percentage: parseInt(match[2], 10) });
  }
  return weights;
};

const extractConditions = (text) => {
  const conditions = [];
  const regex = /switch to (Vendor\s+[a-zA-Z0-9]+) if (\w+) (exceeds|>|is above) (\d+)\s*(seconds?|ms|%)/ig;
  let match;
  while ((match = regex.exec(text)) !== null) {
    let metric = match[2].toLowerCase();
    if (metric === 'latency') metric = 'latency';
    if (metric === 'error rate') metric = 'errorRate';
    
    let unit = match[5].toLowerCase();
    let value = parseInt(match[4], 10);
    if (unit.startsWith('second')) {
      value *= 1000;
      unit = 'ms';
    } else if (unit === '%') {
      metric = 'errorRate'; // simplification for the example
    }

    conditions.push({
      metric,
      operator: '>',
      value,
      unit: unit === '%' ? '%' : 'ms',
      action: 'switchTo',
      vendor: match[1]
    });
  }
  return conditions;
};

const generateRoutingConfig = (text) => {
  const weights = extractWeights(text);
  const conditions = extractConditions(text);
  
  let strategy = 'priority';
  if (weights.length > 0) strategy = 'weighted';

  const vendorOrder = weights.map(w => w.vendor);

  return {
    strategy,
    vendorOrder,
    weights,
    conditions,
    sourceText: text
  };
};

module.exports = { generateRoutingConfig };
