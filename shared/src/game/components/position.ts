import {Component, Types} from 'ecsy';
import {Region} from '../models/region';

export class Position extends Component<Position> {
  // x/y are the the center of the item.
  // todo: change to top left?

  x!: number;
  y!: number;
  width!: number;
  height!: number;

  // Utility getter/setters:

  get left(): number {
    return this.x - this.width / 2;
  }
  set left(left: number) {
    this.x = left + this.width / 2;
  }

  get right(): number {
    return this.x + this.width / 2;
  }
  set right(right: number) {
    this.x = right - this.width / 2;
  }

  get top(): number {
    return this.y - this.height / 2;
  }
  set top(top: number) {
    this.y = top + this.height / 2;
  }

  get bottom(): number {
    return this.y + this.height / 2;
  }
  set bottom(bottom: number) {
    this.y = bottom - this.height / 2;
  }

  public region(): Region {
    return {
      top: this.top,
      left: this.left,
      bottom: this.bottom,
      right: this.right,
    };
  }

  static schema = {
    x: {type: Types.Number},
    y: {type: Types.Number},
    width: {type: Types.Number},
    height: {type: Types.Number},
  };
}
