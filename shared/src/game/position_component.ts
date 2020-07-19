import {PropsOf} from 'src/util/ecsy_types';
import {Component, Types} from 'ecsy';

export class Position extends Component<PropsOf<Position>> {
  x!: number;
  y!: number;

  static schema = {
    x: {type: Types.Number},
    y: {type: Types.Number},
  };
}
