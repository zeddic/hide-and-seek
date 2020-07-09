import {ChatMessage, MoveMessage, Player} from 'lancer-shared/lib/messages';
import React, {ChangeEvent, MouseEvent, useEffect, useState} from 'react';
import {Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import './app.css';
import {SocketService} from './socket_service';

const service = new SocketService();
const sendMove = new Subject<MoveMessage>();

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<Player[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    service.init();
    service.onMessage().subscribe(data => {
      setMessages(v => [...v, data]);
    });

    service.onStateUpdate().subscribe(data => {
      setState(data.players);
    });

    sendMove
      .pipe(throttleTime(16, undefined, {leading: true, trailing: true}))
      .subscribe(msg => {
        service.sendMove(msg);
      });

    return () => service.disconnect();
  }, []);

  function handleMessage() {
    service.send({message: input});
  }

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function handleMove(e: MouseEvent) {
    sendMove.next({x: e.pageX, y: e.pageY});
  }

  return (
    <div className="app" onMouseMove={handleMove}>
      {state.map((p: Player, i) => (
        <div key={i} className="player" style={{top: p.y, left: p.x}}>
          {p.id}
        </div>
      ))}

      {/* <div className="chat-box">
        {messages.map((msg: ChatMessage, i) => (
          <div key={i}>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
      <textarea
        className="App-Textarea"
        placeholder="Type your messsage here..."
        onChange={handleInput}
        value={input}
      ></textarea>
      <p>
        <button onClick={handleMessage}>Send Message</button>
      </p> */}

      {/* <pre>{JSON.stringify(state)}</pre> */}
    </div>
  );
}

export default App;
