import {System, Component, Types} from 'ecsy';
import {PropsOf} from 'lancer-shared/lib/util/ecsy_types';
import {InputState, Key} from './input_system';

export class ClientNetworkComponent extends Component<
  PropsOf<ClientNetworkComponent>
> {
  frame: number = -1;
  lastSyncedFrame: number = -1;

  static schema = {
    frame: {type: Types.Number},
    lastSyncedFrame: {type: Types.Number},
  };
}
