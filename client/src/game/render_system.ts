import {Attributes, Not, System, World} from 'ecsy';
import {Position} from 'lancer-shared/lib/components';
import * as PIXI from 'pixi.js';
import {getLoader} from './resources';
import {Sprite} from './sprite';
import {SpriteResources} from './sprite_resources';
import {RenderState} from './render_state';
import {LocalPlayerControlled} from './local_player_controlled';
import {GameState, GameStage} from 'lancer-shared';

const PLAYER_VISIBILITY_RADIUS_PX = 150;

export class RenderSystem extends System {
  static queries = {
    newSprites: {components: [Sprite, Not(SpriteResources)]},
    removedSprites: {components: [Not(Sprite), SpriteResources]},
    sprites: {components: [Position, Sprite, SpriteResources]},
    others: {components: [Position, Not(Sprite)]},
    player: {components: [Position, LocalPlayerControlled]},
    gameState: {components: [GameState]},
  };

  private readonly renderState: RenderState;
  private readonly spritesStage: PIXI.Container;
  private readonly spritesGraphics: PIXI.Graphics;
  private readonly visibilityMask: PIXI.Graphics; // PIXI.Sprite;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.renderState = attributes.renderState;
    const root = this.renderState.root;

    this.spritesStage = new PIXI.Container();
    root.addChild(this.spritesStage);

    this.spritesGraphics = new PIXI.Graphics();
    root.addChild(this.spritesGraphics);

    this.visibilityMask = this.createPlayerVisibilityMask();
    this.visibilityMask.visible = false;
    root.addChild(this.visibilityMask);
  }

  private createPlayerVisibilityMask() {
    const maskGraphic = new PIXI.Graphics();
    maskGraphic.beginFill(0xff0000, 1);
    maskGraphic.lineStyle(2, 0xff0000, 1);
    maskGraphic.drawCircle(0, 0, PLAYER_VISIBILITY_RADIUS_PX);
    return maskGraphic;
  }

  execute(delta: number, time: number) {
    this.handleSpriteResources();
    this.handleGameState();

    const queries = this.queries;
    const graphics = this.spritesGraphics;

    graphics.clear();
    graphics.lineStyle(2, 0xff0000, 1);

    for (const entity of queries.sprites.results) {
      const p = entity.getComponent(Position);
      const sprite = entity.getComponent(SpriteResources);
      this.syncSpritePosition(p, sprite);
    }

    for (const entity of queries.others.results) {
      const p = entity.getComponent(Position);
      graphics.drawRect(p.left, p.top, p.width, p.height);
    }
  }

  private handleGameState() {
    const gameState = this.getGameState();

    if (gameState.stage === GameStage.PLAYING) {
      if (!this.visibilityMask.visible) {
        this.visibilityMask.visible = true;
        this.renderState.tilemap.mask = this.visibilityMask;
        this.spritesStage.mask = this.visibilityMask;
      }
      this.updateMask();
    } else {
      this.visibilityMask.visible = false;
      this.renderState.tilemap.mask = null;
      this.spritesStage.mask = null;
    }
  }

  private updateMask() {
    const player = this.queries.player.results[0];
    if (!player) return;

    const p = player.getComponent(Position);
    this.visibilityMask.x = p.x;
    this.visibilityMask.y = p.y;
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
      sprite.scale.x = 1.5; // temporary, read from component
      sprite.scale.y = 1.5;
      this.spritesStage.addChild(sprite);
      entity.addComponent(SpriteResources, {sprite});
    }

    for (const entity of queries.removedSprites.results) {
      const data = entity.getComponent(SpriteResources);
      data.sprite.destroy();
      entity.removeComponent(SpriteResources);
    }
  }

  private syncSpritePosition(p: Position, s: SpriteResources) {
    s.sprite.x = p.x;
    s.sprite.y = p.y;
  }

  private getGameState(): GameState {
    const e = this.queries.gameState.results[0];
    return e.getComponent(GameState);
  }
}
