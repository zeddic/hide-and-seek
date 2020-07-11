import React, {useEffect, useRef} from 'react';
import './app.css';
import {Game} from './game/game';

// const service = new SocketService();

function App() {
  const containerEl = useRef<HTMLDivElement | null>(null);

  // Create the game when the component is mounted and destroy it
  // when it is unmounted.
  useEffect(() => {
    const game = new Game(containerEl.current!);
    game.startGameLoop();

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
