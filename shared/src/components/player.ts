import {Component, Types} from 'ecsy';

export class Player extends Component<Player> {
  id: number = -1;
  name: string = 'Unknown';
  role: PlayerRole = PlayerRole.UNASSIGNED;
  isCaptured: boolean = false;

  // This seralize / deserialize is lazy and not really true,
  // but the object is so simple socket.io will translate it.

  serialize() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      isCaptured: this.isCaptured,
    };
  }

  deserialize(data: SerializedPlayer) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role as PlayerRole;
    this.isCaptured = data.isCaptured;
  }

  static schema = {
    id: {type: Types.Number},
    name: {type: Types.String},
    role: {type: Types.String},
    isCaptured: {type: Types.Boolean},
  };
}

export interface SerializedPlayer {
  id: number;
  name: string;
  role: string;
  isCaptured: boolean;
}

export enum PlayerRole {
  SEEKER = 'seeker',
  HIDER = 'hider',
  UNASSIGNED = 'unassigned',
}

export interface Player {
  id: number;
  name: string;
  role: PlayerRole;
  isCaptured: boolean;
}
