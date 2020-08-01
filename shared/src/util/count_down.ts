export interface CountDownOption {
  /**
   * Time in milliseconds.
   */
  duration: number;
}

/**
 * A utility class for counting down how much time has passed in the
 * game simulation.
 *
 * TODO(scott): Make this a more generic tweening function between
 * two arbitrary values over a duration that takes a tweening function.
 *
 * TODO(scott): Should this be powered by a system and an entity instead?
 */
export class CountDown {
  private duration: number;
  private current: number;
  private done = false;
  private justDone = false;

  constructor(options: CountDownOption) {
    this.duration = options.duration;
    this.current = this.duration;
  }

  /**
   * Updates the counter for a single frame.
   * @param delta Time in ms since last call.
   */
  execute(delta: number) {
    if (this.done) {
      if (this.justDone) this.justDone = false;
      return;
    }

    this.current -= delta;
    this.current = Math.max(0, this.current);

    if (this.current === 0) {
      this.done = true;
      this.justDone = true;
    }
  }

  /**
   * Returns true if the counter has completed counting down to 0.
   */
  isDone() {
    return this.done;
  }

  /**
   * Returns true if the counter just finished this game frame.
   */
  isJustDone() {
    return this.justDone;
  }

  value() {
    return this.current;
  }

  reset() {
    this.done = false;
    this.justDone = false;
    this.current = this.duration;
  }
}
