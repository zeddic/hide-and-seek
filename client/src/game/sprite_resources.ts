import {SystemStateComponent, Types} from 'ecsy';

export class SpriteResources extends SystemStateComponent<SpriteResources> {
  sprite!: PIXI.Sprite;

  static schema = {
    sprite: {type: Types.Ref},
  };
}
