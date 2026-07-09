import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { socket } from './socket';
import './index.css';

const Workspace = () => {
  const { roomId } = useParams();
  const [color, setColor] = useState('#e2e8f0');
  const [size, setSize] = useState(5);

  useEffect(() => {
    socket.emit('join-room', roomId);
  }, [roomId]);

  const handleClear = () => {
    socket.emit('clear', roomId);
  };

  return (
    <div className="app-container">
      <Canvas color={color} size={size} roomId={roomId} />
      <Toolbar 
        color={color} 
        setColor={setColor} 
        size={size} 
        setSize={setSize}
        onClear={handleClear}
      />
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  
  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '3rem', margin: 0, background: 'linear-gradient(45deg, var(--accent), #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        DevCanvas
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', textAlign: 'center', maxWidth: '400px' }}>
        Real-time collaborative whiteboarding. Create a secure room and share the URL with your team.
      </p>
      <button onClick={createRoom} className="glass-panel" style={{ padding: '16px 32px', fontSize: '1.1rem', color: 'var(--text-primary)', cursor: 'pointer', border: '1px solid var(--accent)' }}>
        Create New Workspace
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Workspace />} />
      </Routes>
    </Router>
  );
}

export default App;
