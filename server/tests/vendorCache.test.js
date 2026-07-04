const { getCachedVendors, invalidateVendorCache } = require('../utils/vendorCache');

describe('vendorCache', () => {
  afterEach(() => {
    invalidateVendorCache();
    jest.useRealTimers();
  });

  it('serves a cache hit without re-invoking the fetch function', async () => {
    const fetchFn = jest.fn().mockResolvedValue([{ _id: '1', name: 'A' }]);
    await getCachedVendors(fetchFn);
    await getCachedVendors(fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('returns independent clones so one caller mutating its copy cannot affect another', async () => {
    const fetchFn = jest.fn().mockResolvedValue([{ _id: '1', name: 'A' }]);
    const first = await getCachedVendors(fetchFn);
    const second = await getCachedVendors(fetchFn);

    expect(first).not.toBe(second);
    expect(first).toEqual(second);

    first[0].name = 'Mutated';
    expect(second[0].name).toBe('A');
  });

  it('re-fetches immediately after invalidateVendorCache (so a manual vendor edit is reflected right away)', async () => {
    const fetchFn = jest.fn().mockResolvedValue([{ _id: '1', name: 'A' }]);
    await getCachedVendors(fetchFn);
    invalidateVendorCache();
    await getCachedVendors(fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('re-fetches once the TTL expires', async () => {
    jest.useFakeTimers();
    const fetchFn = jest.fn().mockResolvedValue([{ _id: '1', name: 'A' }]);
    await getCachedVendors(fetchFn);
    jest.advanceTimersByTime(10000); // well past the default 3000ms TTL
    await getCachedVendors(fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
