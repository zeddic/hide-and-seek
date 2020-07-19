import {
  ChatMessage,
  MessageType,
  MoveMessage,
  PlayerActionMessage,
  StateUpdateMessage,
} from 'lancer-shared/lib/messages';
import {fromEvent, Observable} from 'rxjs';
import io from 'socket.io-client';
import {inProd} from '../env';

const DEV_SERVER = 'http://localhost:8080';

const PROD_PORT_HTTP = '8080';
const PROD_PORT_HTTPS = '8081';
const PROD_PORT =
  window.location.protocol === 'https:' ? PROD_PORT_HTTPS : PROD_PORT_HTTP;
const PROD_SERVER = `${window.location.protocol}//zeddic.com:${PROD_PORT}`;

const SERVER = inProd() ? PROD_SERVER : DEV_SERVER;

export class ClientSocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  public init() {
    this.socket = io(SERVER);
  }

  // send a message for the server to broadcast
  public send(message: ChatMessage): void {
    this.socket.emit('message', message);
  }

  public sendMove(msg: MoveMessage): void {
    this.socket.emit(MessageType.MOVE, msg);
  }

  public sendPlayerAction(msg: PlayerActionMessage): void {
    this.socket.emit(MessageType.PLAYER_ACTION, msg);
  }

  // link message event to rxjs data source
  public onMessage(): Observable<ChatMessage> {
    return fromEvent(this.socket, 'message');
  }

  public onStateUpdate(): Observable<StateUpdateMessage> {
    return fromEvent(this.socket, MessageType.STATE_UPDATE);
  }

  // disconnect - used when unmounting
  public disconnect(): void {
    this.socket.disconnect();
  }
}
