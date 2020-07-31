import {Component, Types} from 'ecsy';

export class Player extends Component<Player> {
  id: number = -1;
  name: string = 'Unknown';
  role: PlayerRole = PlayerRole.UNASSIGNED;
  isCaptured: boolean = false;

  // This seralize / deserialize is lazy and not really true,
  // but the object is so simple socket.io will translate it.

  serialize() {
    return this;
  }

  deserialize(data: Player) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role;
    this.isCaptured = data.isCaptured;
  }

  static schema = {
    id: {type: Types.Number},
    name: {type: Types.String},
    role: {type: Types.String},
    isCaptured: {type: Types.Boolean},
  };
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
