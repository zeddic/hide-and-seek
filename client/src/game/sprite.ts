import {Image} from './resources';
import {Component, Types} from 'ecsy';

export class Sprite extends Component<Sprite> {
  image: Image = Image.DINO1;

  static schema = {
    image: {type: Types.String},
  };
}
