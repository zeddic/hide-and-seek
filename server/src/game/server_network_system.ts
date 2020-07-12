import {System, World, Attributes} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {Position} from 'lancer-shared/lib/game/position_component';
import {Socket} from 'socket.io';
import {SocketService} from './socket_service';
import {EntityUpdate} from 'lancer-shared/lib/messages';

/**
 */
export class ServerNetworkSystem extends System {
  static queries = {
    movable: {components: [Position, Movement]},
  };

  private readonly socketService: SocketService;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);

    // todo: provide this via attribute so it's setup can be
    // orchestrated elsewhere?
    this.socketService = new SocketService();
  }

  execute(delta: number, time: number) {
    const updates: EntityUpdate[] = [];

    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Movement);

      const update = {
        id: entity.id,
        x: p.x,
        y: p.y,
        v: {x: m.v.x, y: m.v.y},
        a: {x: m.a.x, y: m.a.y},
      };

      updates.push(update);
    }

    this.socketService.sendStateUpdate({updates});
  }
}
