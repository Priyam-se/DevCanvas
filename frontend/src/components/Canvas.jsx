import React, { useRef, useEffect, useState } from 'react';
import { socket } from '../socket';

const Canvas = ({ color, size, roomId }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth - 60;
    canvas.height = window.innerHeight - 60;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    socket.on('initial-history', (history) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      history.forEach(drawData => drawLine(drawData, false));
    });

    socket.on('draw', (data) => {
      drawLine(data, false);
    });

    socket.on('clear', () => {
      clearLocalCanvas();
    });

    const handleResize = () => {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth - 60;
      canvas.height = window.innerHeight - 60;
      context.putImageData(imageData, 0, 0);
      context.lineCap = 'round';
      context.lineJoin = 'round';
    };

    window.addEventListener('resize', handleResize);

    return () => {
      socket.off('initial-history');
      socket.off('draw');
      socket.off('clear');
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawLine = ({ x0, y0, x1, y1, color, size }, emit = true) => {
    const context = contextRef.current;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.stroke();
    context.closePath();

    if (!emit) return;

    socket.emit('draw', {
      roomId,
      drawData: { x0, y0, x1, y1, color, size }
    });
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    setLastPos({ x: offsetX, y: offsetY });
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    drawLine({
      x0: lastPos.x,
      y0: lastPos.y,
      x1: offsetX,
      y1: offsetY,
      color,
      size
    });
    setLastPos({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
    />
  );
};

export default Canvas;
