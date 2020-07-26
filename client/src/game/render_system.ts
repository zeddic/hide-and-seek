import {Attributes, Not, System, World} from 'ecsy';
import {Position} from 'lancer-shared/lib/game/position_component';
import * as PIXI from 'pixi.js';
import {getLoader} from './resources';
import {Sprite} from './sprite';
import {SpriteResources} from './sprite_resources';

export class RenderSystem extends System {
  static queries = {
    newSprites: {components: [Sprite, Not(SpriteResources)]},
    removedSprites: {components: [Not(Sprite), SpriteResources]},
    sprites: {components: [Position, Sprite, SpriteResources]},
    others: {components: [Position, Not(Sprite)]},
  };

  private readonly graphics: PIXI.Graphics;
  private readonly stage: PIXI.Container;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.graphics = attributes.graphics;
    this.stage = attributes.stage;
  }

  execute(delta: number, time: number) {
    const queries = this.queries;

    this.handleSpriteResources();

    for (const entity of queries.sprites.results) {
      const position = entity.getComponent(Position);
      const sprite = entity.getComponent(SpriteResources);
      this.syncSpritePosition(position, sprite);
    }

    this.graphics.clear();
    this.graphics.lineStyle(2, 0xff0000, 1);
    for (const entity of queries.others.results) {
      const p = entity.getComponent(Position);
      this.graphics.drawRect(p.x - 10, p.y - 10, 20, 20);
    }
  }

  private handleSpriteResources() {
    const queries = this.queries;
    const loader = getLoader();

    for (const entity of queries.newSprites.results) {
      const data = entity.getComponent(Sprite);
      const texture = loader.resources[data.image]!.texture;
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      this.stage.addChild(sprite);
      entity.addComponent(SpriteResources, {sprite});
    }

    for (const entity of queries.removedSprites.results) {
      const data = entity.getComponent(SpriteResources);
      data.sprite.destroy();
      entity.removeComponent(SpriteResources);
      console.log('destroy');
    }
  }

  private syncSpritePosition(p: Position, s: SpriteResources) {
    s.sprite.x = p.x;
    s.sprite.y = p.y;
  }
}
