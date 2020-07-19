import {Component, Types} from 'ecsy';
import {CustomTypes} from '../util/ecsy_types';
import {Vector} from '../util/vector';

/**
 * Stores data on entity movement.
 */
export class Movement extends Component<Movement> {
  /** Velocity */
  v!: Vector;

  /** Aceleration */
  a!: Vector;

  static schema = {
    v: {type: CustomTypes.Vector, default: new Vector(0, 0)},
    a: {type: CustomTypes.Vector, default: new Vector(0, 0)},
    x: {type: Types.Number},
  };
}
