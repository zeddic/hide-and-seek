import {Component, Types} from 'ecsy';

export class LocalPlayerComponent extends Component<LocalPlayerComponent> {
  confirmed: number[] = [];
  playerId: number = -1;

  static schema = {
    playerId: {type: Types.Number},
    confirmed: {type: Types.Array},
    // lastProcessedInput: {type: Types.Number},
  };
}
