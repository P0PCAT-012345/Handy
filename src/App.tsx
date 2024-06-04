import { useState, useEffect } from 'react';
import {client} from './websocketService/websocketService';
import WebCamera from './components/Webcam';


function App() {
  const [serverLoaded, setServerLoaded] = useState(false);
  const [landmarks, setLandmarks] = useState(new Array);

  if (!serverLoaded && client.OPEN){
    console.log(client.OPEN)
    setServerLoaded(true);
  }


    
    const record = () => {
      client.send(JSON.stringify({"function": "search", "kwargs": {'landmarks': landmarks}}))
    }

    
  return (
    <>
    {serverLoaded && <div className="flex flex-col">
      <WebCamera video={{width: 600, height:400}} setLandmarks={setLandmarks} landmarks={landmarks}/>
      <button className="bg-blue-500 text-white font-bold h-[5vh] rounded hover:bg-blue-700" onClick={record}>
        Record
      </button>
      
    </div>}
      
    </>
  );
}

export default App;