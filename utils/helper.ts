export function getRandomValue<T>(iterable: T[]): T {
  if (!Array.isArray(iterable) || iterable.length === 0) {
    throw Error('iterable is Empty');
  }
  return iterable[Math.floor(Math.random() * iterable.length)];
}

export function getSearchString(str: string): string {
  return str.toLowerCase().slice(Math.floor(Math.random() * str.length));
}
