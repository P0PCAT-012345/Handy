import React, { useRef, useCallback, useState, useEffect } from 'react';
import {client} from './websocketService/websocketService';
import { invoke } from "@tauri-apps/api/tauri";
import WebCamera from './components/Webcam';


function App() {
  const [response, setResponse] = useState('');

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

    const handleSendMessage = () => {
        const message = 'Hello, Python!';
        console.log(performance.now())
        console.log(`Sending message to server: ${message}`);
        client.send(message);
    };

    
  return (
    <>
    <div className="flex flex-col">
      <WebCamera video={{width: 600, height:400}}/>
      <button className="bg-blue-500 text-white font-bold h-[5vh] rounded hover:bg-blue-700" onClick={handleSendMessage}>
        Record
      </button>
      
    </div>
      
    </>
  );
}

export default App;