import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { socket } from './socket';
import './index.css';

function App() {
  const [color, setColor] = useState('#e2e8f0');
  const [size, setSize] = useState(5);

  const handleClear = () => {
    socket.emit('clear');
  };

  return (
    <div className="app-container">
      <Canvas color={color} size={size} />
      <Toolbar 
        color={color} 
        setColor={setColor} 
        size={size} 
        setSize={setSize}
        onClear={handleClear}
      />
    </div>
  );
}

export default App;
