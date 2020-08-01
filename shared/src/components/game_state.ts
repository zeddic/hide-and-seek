import {Component, Types} from 'ecsy';

export class GameState extends Component<GameState> {
  stage: GameStage = GameStage.PRE_GAME;
  countdown: number = 0;

  serialize(): SerializedGameState {
    return {
      stage: this.stage,
      countdown: Math.floor(this.countdown),
    };
  }

  deserialize(data: SerializedGameState) {
    this.stage = data.stage;
    this.countdown = data.countdown;
  }

  static schema = {
    stage: {type: Types.String},
    countdown: {type: Types.Number},
  };
}

export interface SerializedGameState {
  stage: GameStage;
  countdown: number;
}

export enum GameStage {
  CONNECTING = 'connecting',
  PRE_GAME = 'pre_game',
  COUNTING_DOWN = 'counting_down',
  PLAYING = 'playing',
  POST_GAME = 'post_game',
}
