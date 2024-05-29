import React, { useRef, useCallback, useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import WebCamera from './components/Webcam';

import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

type MediaProps = {
  audio: boolean;
  video: {
    width: number;
    height: number;
  };
};


function App() {

 

  return (
    <>
    <div className="flex flex-col">
      <WebCamera video={{width: 600, height:400}}/>
      <button className="bg-blue-500 text-white font-bold h-[5vh] rounded hover:bg-blue-700" >
        Record
      </button>
      
    </div>
      
    </>
  );
}

export default App;