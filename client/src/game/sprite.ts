import {Image} from './resources';
import {Component, Types} from 'ecsy';

export class Sprite extends Component<Sprite> {
  image: Image = Image.SHIP;

  static schema = {
    image: {type: Types.String},
  };
}
