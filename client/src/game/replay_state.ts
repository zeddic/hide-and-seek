import {Component, Types} from 'ecsy';

export class ReplayState extends Component<ReplayState> {
  isReplaying = false;
  frameCount = 0;

  static schema = {
    isReplaying: {type: Types.Boolean},
    frameCount: {type: Types.Number},
  };
}
