import {Attributes, Not, System, World, Entity} from 'ecsy';
import {Position, Player, PlayerRole} from 'lancer-shared/lib/components';
import * as PIXI from 'pixi.js';
import {getLoader} from './resources';
import {Sprite} from './sprite';
import {SpriteResources} from './sprite_resources';
import {RenderState} from './render_state';
import {LocalPlayerControlled} from './local_player_controlled';
import {GameState, GameStage} from 'lancer-shared';
import {Footprint} from './footprint';

const PLAYER_VISIBILITY_RADIUS_PX = 150;
const MAX_FOOTPRINT_RADIUS_PX = 20;

const TEXT_STYLE = new PIXI.TextStyle({
  fill: 'white',
  fontSize: 14,
});

export class RenderSystem extends System {
  static queries = {
    newSprites: {components: [Sprite, Not(SpriteResources)]},
    removedSprites: {components: [Not(Sprite), SpriteResources]},
    sprites: {
      components: [Position, Sprite, SpriteResources],
      listen: {changed: true}, // changed: [Sprite]
    },
    others: {components: [Position, Not(Sprite)]},
    player: {components: [Position, LocalPlayerControlled]},
    footprints: {components: [Position, Footprint]},
    gameState: {components: [GameState]},
  };

  private readonly renderState: RenderState;
  private readonly spritesStage: PIXI.Container;
  private readonly alwaysVisibleGraphics: PIXI.Graphics;
  private readonly spritesGraphics: PIXI.Graphics;
  private readonly visibilityMask: PIXI.Graphics;
  private readonly hideEverythingMask: PIXI.Graphics;

  private readonly stageText: PIXI.Text;
  private readonly countdownText: PIXI.Text;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.renderState = attributes.renderState;
    const root = this.renderState.root;

    this.spritesStage = new PIXI.Container();
    root.addChild(this.spritesStage);

    this.spritesGraphics = new PIXI.Graphics();
    this.spritesStage.addChild(this.spritesGraphics);

    this.alwaysVisibleGraphics = new PIXI.Graphics();
    root.addChild(this.alwaysVisibleGraphics);

    this.visibilityMask = this.createPlayerVisibilityMask();
    this.visibilityMask.visible = false;
    root.addChild(this.visibilityMask);

    this.hideEverythingMask = new PIXI.Graphics();

    this.stageText = new PIXI.Text('STAGE', TEXT_STYLE);
    this.stageText.position.set(500, 0);
    this.stageText.anchor.x = 0.5;
    root.addChild(this.stageText);

    this.countdownText = new PIXI.Text('-', TEXT_STYLE);
    this.countdownText.position.set(500, 50);
    this.countdownText.anchor.x = 0.5;
    root.addChild(this.countdownText);
  }

  private createPlayerVisibilityMask() {
    const maskGraphic = new PIXI.Graphics();
    maskGraphic.beginFill(0xff0000, 1);
    maskGraphic.lineStyle(2, 0xff0000, 1);
    maskGraphic.drawCircle(0, 0, PLAYER_VISIBILITY_RADIUS_PX);
    return maskGraphic;
  }

  execute(delta: number, time: number) {
    this.alwaysVisibleGraphics.clear();
    this.spritesGraphics.clear();

    this.handleSpriteResources();
    this.handleGameState();

    const queries = this.queries;
    const graphics = this.spritesGraphics;

    graphics.lineStyle(2, 0xff0000, 1);

    for (const entity of queries.sprites.results) {
      this.syncSprite(entity);
    }

    for (const entity of queries.others.results) {
      const p = entity.getComponent(Position);
      graphics.drawRect(p.left, p.top, p.width, p.height);
    }

    for (const entity of queries.footprints.results) {
      // this.renderFootprint(entity);
    }
  }

  private handleGameState() {
    const gameState = this.getGameState();
    const localPlayer = this.getLocalPlayer();
    const player = localPlayer?.getComponent(Player);
    const isCaptured = player?.isCaptured;
    const isSeeker = player?.role === PlayerRole.SEEKER;

    this.stageText.text = gameState.stage;

    // Only show the countdown while in counting down
    if (gameState.stage === GameStage.COUNTING_DOWN) {
      this.countdownText.visible = true;
      const secs = Math.floor(gameState.countdown / 1000);
      this.countdownText.text = String(secs);
    } else {
      this.countdownText.visible = false;
    }

    // Only use the visibility mask while the game is playing
    // and the user has not yet be caught.
    if (gameState.stage === GameStage.PLAYING && !isCaptured) {
      if (!this.visibilityMask.visible) {
        this.visibilityMask.visible = true;
        this.renderState.tilemap.mask = this.visibilityMask;
        this.spritesStage.mask = this.visibilityMask;
      }
      this.updateMask();
    } else if (gameState.stage === GameStage.COUNTING_DOWN && isSeeker) {
      this.renderState.tilemap.mask = this.hideEverythingMask;
      this.spritesStage.mask = this.hideEverythingMask;
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

    for (const entity of queries.sprites.changed!.values()) {
      const sprite = entity.getComponent(Sprite);
      const texture = loader.resources[sprite.image]!.texture;
      const spriteResources = entity.getComponent(SpriteResources);
      spriteResources.sprite.texture = texture;
    }
  }

  private renderFootprint(entity: Entity) {
    // todo: sprite more effecient?
    const graphics = this.alwaysVisibleGraphics;
    const position = entity.getComponent(Position);
    const footprint = entity.getComponent(Footprint);

    // radius starts small and grows big as the footprint ages.
    const radius =
      MAX_FOOTPRINT_RADIUS_PX -
      MAX_FOOTPRINT_RADIUS_PX * footprint.percentLife();
    const alpha = footprint.percentLife();

    graphics.lineStyle(2, 0xff0000, alpha);
    graphics.drawCircle(position.x, position.y, radius);
  }

  private syncSprite(entity: Entity) {
    const p = entity.getComponent(Position);
    const s = entity.getComponent(SpriteResources);
    const player = entity.getComponent(Player);
    const isLocalPlayer = entity.hasComponent(LocalPlayerControlled);

    s.sprite.x = p.x;
    s.sprite.y = p.y;

    s.sprite.visible = !player.isCaptured || isLocalPlayer;

    if (isLocalPlayer) {
      s.sprite.alpha = player.isCaptured ? 0.3 : 1;
    }
  }

  private getGameState(): GameState {
    const e = this.queries.gameState.results[0];
    return e.getComponent(GameState);
  }

  private getLocalPlayer(): Entity {
    return this.queries.player.results[0];
  }

  private isLocalPlayerAGhost() {
    const player = this.getLocalPlayer();
    const p = player.getComponent(Player);
    return p.isCaptured;
  }
}
