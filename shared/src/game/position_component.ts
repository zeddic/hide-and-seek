import {PropsOf} from 'src/util/ecsy_types';
import {Component, Types} from 'ecsy';

export class Position extends Component<PropsOf<Position>> {
  x!: number;
  y!: number;

  // constructor(blah) {
  //   // console.log('in position!');
  //   // console.log(blah);
  //   // super(blah);
  // }

  static schema = {
    x: {type: Types.Number},
    y: {type: Types.Number},
  };
}
