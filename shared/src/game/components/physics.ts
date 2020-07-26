import {Component, Types} from 'ecsy';
import {CustomTypes} from '../ecsy_types';
import {Vector} from '../util/vector';

/**
 * Stores data on entity movement.
 */
export class Physics extends Component<Physics> {
  /** Velocity */
  v!: Vector;

  /** Aceleration */
  a!: Vector;

  mass: number = 0;

  static schema = {
    v: {type: CustomTypes.Vector, default: new Vector(0, 0)},
    a: {type: CustomTypes.Vector, default: new Vector(0, 0)},
    mass: {type: Types.Number, default: 0},
  };
}
