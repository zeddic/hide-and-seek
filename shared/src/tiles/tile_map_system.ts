import {System, World, Attributes} from 'ecsy';
import {TileMapState} from './tile_map_state';
import {TileMap, TileMapOptions, SerializedTileMap} from './tile_map';

export class TileMapSystem extends System {
  static queries = {
    state: {components: [TileMapState]},
  };

  private readonly options: TileMapOptions;

  constructor(world: World, attributes: Attributes) {
    super(world);
    this.options = attributes.options;
  }

  init() {
    const map = new TileMap(this.options);
    this.world.registerComponent(TileMapState);
    this.world.createEntity().addComponent(TileMapState, {map});
  }

  execute(delta: number) {
    // no-op
  }

  serialize(): SerializedTileMap {
    return this.getState().map.seralize();
  }

  deserialize(data: SerializedTileMap) {
    return this.getState().map.deserialize(data);
  }

  private getState() {
    const entity = this.queries.state.results[0];
    const state = entity.getMutableComponent(TileMapState);
    return state;
  }
}
