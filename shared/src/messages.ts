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
  updates: EntityUpdate[];
}

export interface EntityUpdate {
  id: number;
  x: number;
  y: number;
  v: {
    x: number;
    y: number;
  };
  a: {
    x: number;
    y: number;
  };
}
