/**
 * Given a game update() function that accepts a delta in ms that have
 * occured since the last time it has called and the current time, wrap
 * it so that it will only ever be called with a fixed delta. Calls to
 * the wrapper function will accumlate time that has passed until the
 * fixed interval has been reached.
 *
 * Doing this allows us to keep our update simulation logic stable between
 * runtime environments.
 */
export function createFixedTimestepFn(
  fixedIntervalMs: number,
  callback: ExecteFn
) {
  let accumulator = 0;
  let updates = 0;

  return function fixedExecuteFn(delta: number, time: number) {
    accumulator += delta;
    updates = 0;

    while (accumulator > fixedIntervalMs) {
      callback(fixedIntervalMs, time + updates * fixedIntervalMs);
      accumulator -= fixedIntervalMs;
      updates++;
    }
  };
}

export interface ExecteFn {
  (delta: number, time: number): any;
}
