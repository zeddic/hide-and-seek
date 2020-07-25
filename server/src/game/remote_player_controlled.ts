import {System, Component, Types} from 'ecsy';
import {ActionSnapshot} from 'lancer-shared/lib/game/actions';

/**
 * Contains information about an entity that is being remotely controlled
 * via a client.
 */
export class RemotePlayerControlled extends Component<RemotePlayerControlled> {
  /**
   * The unique id of the remote player controlling the entity.
   */
  playerId = -1;

  /**
   * A queue of action states that have been sent from the client.
   * Each entry contains any actions the user specified via
   * input (eg 'jump', 'move_left') and the frame number that the
   * client was rendering when the state was captured.
   *
   * Note that frame number will be LESS than the frame number on
   * the server due to latency.
   */
  inputQueue: ActionSnapshot[] = [];

  /**
   * The frame number of the last processed ActionsState by the
   * system. Used for client syncronization so it can know if
   * the server has processed all inputs it has sent.
   */
  lastProcessedInput?: number;

  static schema = {
    playerId: {type: Types.Number},
    inputQueue: {type: Types.Array},
    lastProcessedInput: {type: Types.Number},
  };
}
