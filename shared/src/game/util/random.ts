/**
 * Returns a random value between min/max
 */
export function randomValue(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Random int between min (inclusive) and max (exclusive)
 */
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}
