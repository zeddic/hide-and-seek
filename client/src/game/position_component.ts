import {Component, Types} from 'ecsy';

export interface VelocityProps {
  x: number;
  y: number;
}

export class Velocity extends Component<VelocityProps> {
  x!: number;
  y!: number;

  static schema = {
    x: {type: Types.Number},
    y: {type: Types.Number},
  };
}

export class Position extends Component<VelocityProps> {
  x!: number;
  y!: number;

  static schema = {
    x: {type: Types.Number},
    y: {type: Types.Number},
  };
}
