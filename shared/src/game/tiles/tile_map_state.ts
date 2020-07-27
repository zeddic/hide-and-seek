import {Component, Types} from 'ecsy';
import {CustomTypes} from '../ecsy_types';
import {Vector} from '../util/vector';
import {TileMap} from './tile_map';

/**
 * Stores global state for the tile map system.
 */
export class TileMapState extends Component<TileMapState> {
  /**
   * Contains the tile map data.
   */
  map!: TileMap;

  static schema = {
    map: {type: Types.Ref},
  };
}
