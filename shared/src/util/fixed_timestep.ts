/**
 * Given a game update() function that accepts a delta in ms that have
 * occured since the last time it has called, wrap it so that it will only
 * ever be called with a fixed delta. Calls to the wrapper function will
 * accumlate time that has passed until the fixed interval has been reached.
 *
 * Doing this allows us to keep our update simulation logic stable between
 * runtime environments, as slight variations in delta can result in
 * differences in simulation.
 */
export function createFixedTimestepFn(
  fixedIntervalMs: number,
  callback: ExecteFn
) {
  let accumulator = 0;

  return function fixedExecuteFn(delta: number, time: number) {
    accumulator += delta;

    while (accumulator > fixedIntervalMs) {
      callback(fixedIntervalMs, fixedIntervalMs / 1000);
      accumulator -= fixedIntervalMs;
    }
  };
}

export interface ExecteFn {
  (delta: number, time: number): any;
}
