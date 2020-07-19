import {Component, Types} from 'ecsy';

export class ClientNetworkComponent extends Component<ClientNetworkComponent> {
  frame: number = -1;
  lastSyncedFrame: number = -1;

  static schema = {
    frame: {type: Types.Number},
    lastSyncedFrame: {type: Types.Number},
  };
}
