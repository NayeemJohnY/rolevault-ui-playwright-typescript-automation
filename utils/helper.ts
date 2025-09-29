export function getRandomValue<T>(iterable: T[]): T {
  if (!Array.isArray(iterable) || iterable.length === 0) {
    throw Error('iterable is Empty');
  }
  return iterable[Math.floor(Math.random() * iterable.length)];
}

export function getSearchString(str: string): string {
  const lowerStr = str.toLowerCase();
  if (lowerStr.length <= 4) {
    return lowerStr;
  }
  const start = Math.floor(Math.random() * (lowerStr.length - 4));
  const end = Math.floor(Math.random() * (lowerStr.length - start)) + 4;
  return lowerStr.slice(start, start + end);
}
