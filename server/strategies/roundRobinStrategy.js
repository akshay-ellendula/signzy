// Rotates through vendors using a cursor tied to the *last selected vendor's
// id*, not an array index - so rotation stays stable even when the eligible
// set changes shape between calls (a vendor becoming rate-limited, say,
// doesn't desync which vendor is "next").
const lastSelectedId = new Map();

const rank = (vendors, context = {}) => {
  if (vendors.length === 0) return [];

  const key = context.capability || '__global__';
  const sorted = [...vendors].sort((a, b) => String(a._id).localeCompare(String(b._id)));

  const lastId = lastSelectedId.get(key);
  let startIndex = 0;
  if (lastId) {
    const nextIndex = sorted.findIndex((v) => String(v._id) > lastId);
    startIndex = nextIndex === -1 ? 0 : nextIndex;
  }

  const rotated = [...sorted.slice(startIndex), ...sorted.slice(0, startIndex)];
  lastSelectedId.set(key, String(rotated[0]._id));

  return rotated;
};

module.exports = { rank };
