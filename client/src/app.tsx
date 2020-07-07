import React, {useEffect, useState, SyntheticEvent, ChangeEvent} from 'react';
import './app.css';
import {SocketService} from './socket_service';
import {ChatMessage} from 'lancer-shared/net/messages';

const service = new SocketService();

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    service.init();
    service.onMessage().subscribe(data => {
      console.log(data);
      setMessages(v => [...v, data]);
    });
    service.send({message: 'hello'});
    return () => service.disconnect();
  }, []);

  function handleMessage() {
    service.send({message: input});
  }

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  return (
    <div className="App">
      <div className="chat-box">
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
      </p>
    </div>
  );
}

export default App;
