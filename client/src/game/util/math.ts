/**
 * Given a number, returns the exponent of 2 that is closest without
 * going over.
 *
 * For example:
 *   8 returns 3 because 2 ^ 3 = 8
 *   16 returns 4 because 2 ^ 4 = 16
 *   61 returns 5 because 2 ^ 5 = 32 and 2 ^ 6 = 64
 */
export function getClosestExponentOfTwo(num: number) {
  let count = 0;
  while (num > 1) {
    num = Math.floor(num / 2);
    count++;
  }
  return count;
}
