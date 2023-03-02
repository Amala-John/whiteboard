import './App.css';
import { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import io from 'socket.io-client';
function App() {
  const [canvas, setCanvas] = useState(null);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#0052cc');
  const [eraserMode, setEraserMode] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);
  const [panningMode, setPanningMode] = useState(false);
  const [shapeMode, setShapeMode] = useState(null);
  const [highlighterMode, setHighlighterMode] = useState(false);
  const [backgroundColor] = useState('#ffffff');
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const canvasElement = document.getElementById('canvas');
    const canvas = new fabric.Canvas(canvasElement);
    const newSocket = io('http://localhost:3001'); // Replace with your own server URL
    setSocket(newSocket);
    setCanvas(canvas);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (canvas  && socket) {
      canvas.setHeight(window.innerHeight);
      canvas.setWidth(window.innerWidth);
      canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = brushColor;
      canvas.on('path:created', ({ path }) => {
        socket.emit('path:created', path.toJSON());
      });
  
      socket.on('path:created', (pathJSON) => {
        const path = fabric.Path.fromObject(pathJSON);
        canvas.add(path);
      });
    }
  }, [canvas, brushSize, brushColor, backgroundColor,socket]);

  useEffect(() => {
    if (canvas ) {
      if (eraserMode) {
        canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
        canvas.freeDrawingBrush.color = '#ffffff';
        canvas.freeDrawingBrush.width = eraserSize;
      } else if (highlighterMode) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = 'rgba(255,255,0,0.5)';
      } else {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = brushSize;
      }
    }
  }, [canvas, eraserMode, eraserSize, brushColor, brushSize, highlighterMode]);

  useEffect(() => {
    if (canvas) {
      if (panningMode) {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((o) => {
          o.set('selectable', false);
        });
        canvas.defaultCursor = 'grab';
        canvas.setCursor('grab');
      } else {
        canvas.isDrawingMode = true;
        canvas.selection = true;
        canvas.forEachObject((o) => {
          o.set('selectable', true);
        });
        canvas.defaultCursor = 'default';
        canvas.setCursor('default');
      }
    }
  }, [canvas, panningMode]);

  useEffect(() => {
    if (canvas) {
      if (shapeMode) {
        canvas.isDrawingMode = false;
        const shapeClass = shapeMode === 'rectangle' ? fabric.Rect : fabric.Circle;
        const shape = new shapeClass({
          left: canvas.width / 2 - 50,
          top: canvas.height / 2 - 50,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: brushSize,
          width: 100,
          height: 100,
        });
        canvas.add(shape);
        canvas.setActiveObject(shape);
      } else {
        canvas.isDrawingMode = true;
      }
    }
  }, [canvas, shapeMode, brushSize, brushColor]);

  const handleBrushSizeChange = (event) => {
    setBrushSize(parseInt(event.target.value));
  };

  const handleBrushColorChange = (event) => {
    setBrushColor(event.target.value);
  };
  
  const handleEraserModeToggle = () => {
  setEraserMode(!eraserMode);
  };
  
  const handleEraserSizeChange = (event) => {
  setEraserSize(parseInt(event.target.value));
  };
  
  const handlePanningModeToggle = () => {
  setPanningMode(!panningMode);
  };
  
  const handleShapeModeChange = (event) => {
  setShapeMode(event.target.value);
  };
  
  const handleHighlighterModeToggle = () => {
  setHighlighterMode(!highlighterMode);
  };
  
  
  return (
  <div className="App">
  <canvas id="canvas"></canvas>
  <div className="controls">
  <div className="brush-controls">
  <label htmlFor="brush-size">Brush size:</label>
  <input type="range" id="brush-size" min="1" max="50" value={brushSize} onChange={handleBrushSizeChange} />
  <label htmlFor="brush-color">Brush color:</label>
  <input type="color" id="brush-color" value={brushColor} onChange={handleBrushColorChange} />
  <button onClick={handleEraserModeToggle}>{eraserMode ? 'Disable' : 'Enable'} Eraser</button>
  {eraserMode && (
  <div className="eraser-controls">
  <label htmlFor="eraser-size">Eraser size:</label>
  <input type="range" id="eraser-size" min="1" max="50" value={eraserSize} onChange={handleEraserSizeChange} />
  </div>
  )}
  <button onClick={handlePanningModeToggle}>{panningMode ? 'Disable' : 'Enable'} Panning</button>
  <label htmlFor="shape-mode">Shape mode:</label>
  <select id="shape-mode" value={shapeMode || ""} onChange={handleShapeModeChange}>
  <option value="">None</option>
  <option value="rectangle">Rectangle</option>
  <option value="circle">Circle</option>
</select>

  <button onClick={handleHighlighterModeToggle}>{highlighterMode ? 'Disable' : 'Enable'} Highlighter</button>
  </div>
  </div>
  </div>
  );
  }
  
  export default App;
  
  
  
  