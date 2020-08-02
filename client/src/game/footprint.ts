import {Types, Component} from 'ecsy';

/**
 * Identifies an entity as a footprint left by a player who was running
 * too quickly and gave away their location in their world.
 */
export class Footprint extends Component<Footprint> {
  /**
   * The current life left for this footprint in milliseconds.
   */
  life: number = 1;

  /**
   * The original maximum life given to this footprint in milliseconds.
   */
  maxLife: number = 1;

  /**
   * Returns the current life left as a percentage (0 -> 1) of overall life.
   */
  percentLife() {
    if (this.maxLife === 0) {
      return 0;
    }

    return this.life / this.maxLife;
  }

  static schema = {
    life: {type: Types.Number},
    maxLife: {type: Types.Number},
  };
}
