import {Component, Types} from 'ecsy';
import {ActionSnapshot} from 'lancer-shared/lib/actions';

/**
 * System state related to network the network connection.
 */
export class NetworkState extends Component<NetworkState> {
  /**
   * The last frame number on the server that the clien synced state with.
   */
  frame: number = -1;

  /**
   * A unique id that the server has assigned this client.
   */
  playerId: number = -1;

  /**
   * A list of user input that the client application has performed, but has
   * not yet recieved confirmation from the server that it has been processed.
   */
  unconfirmedActions: ActionSnapshot[] = [];

  /**
   * The ID of the last user input that was confirmed by the server.
   */
  lastConfirmedAction: number = -1;

  static schema = {
    frame: {type: Types.Number},
    playerId: {type: Types.Number},
    unconfirmedActions: {type: Types.Ref},
    lastConfirmedAction: {type: Types.Number},
  };
}
