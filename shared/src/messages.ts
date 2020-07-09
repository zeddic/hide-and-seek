export enum MessageType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  MOVE = 'move',
  STATE_UPDATE = 'state_update',
}

export interface ChatMessage {
  message: string;
}

export interface MoveMessage {
  x: number;
  y: number;
}

export interface StateUpdateMessage {
  players: Player[];
}

export interface Player {
  x: number;
  y: number;
  id: string;
}
