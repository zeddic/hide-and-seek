import {ActionSnapshot} from './actions';
import {SerializedTileMap} from './tiles/tile_map';
import {GameState, SerializedGameState} from './components/game_state';
import {Player} from './components';

export enum MessageType {
  CONNECT = 'connect',
  INIT = 'init',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  MOVE = 'move',
  STATE_UPDATE = 'state_update',
  PLAYER_ACTION = 'player_action',
}

export interface ChatMessage {
  message: string;
}

export interface MoveMessage {
  x: number;
  y: number;
}

export interface PlayerActionMessage extends ActionSnapshot {}

export interface InitGameMessage {
  currentFrame: number;
  initialState: EntityUpdate[];
  playerId: number;
  entityId: number;
  tileMap: SerializedTileMap;
}

export interface StateUpdateMessage {
  frame: number;
  updates: EntityUpdate[];
  lastProcessedInput?: number;
  gameState?: SerializedGameState;
}

export interface EntityUpdate {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  v: {
    x: number;
    y: number;
  };
  a: {
    x: number;
    y: number;
  };
  m: number;
  player?: Player;
}
