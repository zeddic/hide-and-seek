import React, {useEffect} from 'react';
import './app.css';
import {SocketService} from './socket_service';

const service = new SocketService();

function App() {
  useEffect(() => {
    service.init();
    service.send({message: 'hello'});
    return () => service.disconnect();
  }, []);

  return <div className="App">Content goes here</div>;
}

export default App;
