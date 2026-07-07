import React from 'react';
import { Eraser, Trash2, PenTool } from 'lucide-react';

const Toolbar = ({ color, setColor, size, setSize, onClear }) => {
  return (
    <div className="glass-panel toolbar">
      <div className="tool-group">
        <button className={color !== '#1e2130' ? 'active' : ''} onClick={() => setColor('#e2e8f0')}>
          <PenTool size={20} />
        </button>
        <button className={color === '#1e2130' ? 'active' : ''} onClick={() => setColor('#1e2130')} title="Eraser">
          <Eraser size={20} />
        </button>
      </div>
      
      <div className="divider" />
      
      <div className="tool-group">
        <input 
          type="color" 
          value={color === '#1e2130' ? '#e2e8f0' : color} 
          onChange={(e) => setColor(e.target.value)} 
          className="color-picker"
        />
        <input 
          type="range" 
          min="1" 
          max="50" 
          value={size} 
          onChange={(e) => setSize(parseInt(e.target.value))} 
          className="size-slider"
        />
      </div>

      <div className="divider" />

      <div className="tool-group">
        <button onClick={onClear} title="Clear Canvas">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
