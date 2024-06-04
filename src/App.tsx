import React, { useRef, useCallback, useState, useEffect } from 'react';
import {client} from './websocketService/websocketService';
import { invoke } from "@tauri-apps/api/tauri";
import WebCamera from './components/Webcam';


function App() {
  const [response, setResponse] = useState('');
  const [landmarks, setLandmarks] = useState(new Array);

  useEffect(() => {
      client.onopen = () => {
          console.log('Connected to Python WebSocket server');
      };

      client.onmessage = (message) => {
          console.log('Received message from server:', message.data);
          console.log(performance.now())
          setResponse(String(message.data));
      };

      client.onerror = (error) => {
          console.error('WebSocket error:', error);
      };

      client.onclose = () => {
          console.log('Disconnected from Python WebSocket server');
      };
    }, []);

    
    const record = () => {
      // const arrayedLandmarks
      client.send(JSON.stringify({"function": "search", "kwargs": {'landmarks': landmarks}}))
    }

    
  return (
    <>
    <div className="flex flex-col">
      <WebCamera video={{width: 600, height:400}} setLandmarks={setLandmarks} landmarks={landmarks}/>
      <button className="bg-blue-500 text-white font-bold h-[5vh] rounded hover:bg-blue-700" onClick={record}>
        Record
      </button>
      
    </div>
      
    </>
  );
}

export default App;