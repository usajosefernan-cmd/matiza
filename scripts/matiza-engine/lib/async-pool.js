export async function mapLimit(items, limit, worker) {
  const safeLimit = Math.max(1, Number.parseInt(limit || 1, 10));
  const results = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(safeLimit, items.length || 1) }, () => runWorker());
  await Promise.all(workers);
  return results;
}

export async function settleMapLimit(items, limit, worker) {
  return mapLimit(items, limit, async (item, index) => {
    try {
      return { status: 'fulfilled', value: await worker(item, index) };
    } catch (reason) {
      return { status: 'rejected', reason };
    }
  });
}
