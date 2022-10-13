export function arrayToMap<T = any>(
  items: T[],
  getKeyFn: (item: T) => string
): { [key: string]: T[] } {
  return items.reduce((acc, item) => {
    const k = getKeyFn(item);
    if (typeof k === "string") {
      acc[k] = [...(acc[k] || []), item];
    }
    return acc;
  }, {} as { [key: string]: T[] });
}
