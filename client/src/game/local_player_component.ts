import {Component, Types} from 'ecsy';

export class LocalPlayerComponent extends Component<LocalPlayerComponent> {
  playerId: number = -1;

  static schema = {
    playerId: {type: Types.Number},
  };
}
