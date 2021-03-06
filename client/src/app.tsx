import React, {useEffect, useRef} from 'react';
import './app.css';
import {ClientGame} from './game/client_game';

// const service = new SocketService();

function App() {
  const containerEl = useRef<HTMLDivElement | null>(null);

  // Create the game when the component is mounted and destroy it
  // when it is unmounted.
  useEffect(() => {
    const game = new ClientGame(containerEl.current!);
    game.setup();

    return () => {
      game.destroy();
    };
  }, []);

  // TODO: Move this to game or a network system
  // useEffect(() => {
  //   service.init();
  //   return () => service.disconnect();
  // }, []);

  return <div className="app" ref={containerEl}></div>;
}

export default App;
