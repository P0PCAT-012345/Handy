import React, { useEffect, useRef, useState } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { invoke } from "@tauri-apps/api";
import ButtonComponent from './ButtonComponent';

type MediaProps = {
  video: {
    width: number;
    height: number;
  };
  setLandmarks: React.Dispatch<React.SetStateAction<any[]>>;
  landmarks: Array<Array<{x: number, y: number, z: number}>>;
};

const WebCamera: React.FC<MediaProps> = ({ video, setLandmarks, landmarks }) => {
  const constraints = {
    audio: false,
    video: {
      width: video.width,
      height: video.height,
    },
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraState, setCameraState] = useState(false);
  const handsRef = useRef<Hands | null>(null);

  useEffect(() => {
    const setupHands = async () => {
      try {
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults(onResults);
        handsRef.current = hands;

      } catch (error) {
        console.error("Error setting up hands:", error);
      }
    };
    if (canvasRef) {
      setupHands();
    }

  }, [videoRef]);

  useEffect(() => {
    if (landmarks.length > 0) {
      const formattedLandmarks = landmarks.map((handLandmarks) =>
        handLandmarks.map((landmark: { x: number, y: number, z: number }) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
        }))
      );
      invoke('update_landmark', { landmarks: formattedLandmarks }).catch((e) => console.error(e));
    }
  }, [landmarks]);

  const onResults = (results: any) => {
    try {
      if (!canvasRef.current || !videoRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;
      setLandmarks(results.multiHandLandmarks);
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.translate(canvasRef.current.width, 0);
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 2, 
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: '#FF0000',
            lineWidth: 1, 
            radius: 2, 
          });
        }
      }
      canvasCtx.restore();
    } catch (error) {
      console.error('Error processing results:', error);
    }
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch (error) {
                console.log("Loading ", error);
              }
            }
          },
          width: video.width,
          height: video.height,
        });
        camera.start();
      }
    }).catch(error => {
      console.error('Error accessing media devices:', error);
    });

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        videoRef.current!.srcObject = cameraState ? null : stream;
      }).catch(error => {
        console.error('Error accessing media devices:', error);
      });
    }
  }, [cameraState]);

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      <div className="flex-1 w-full flex justify-center items-center relative">
        <video
          ref={videoRef}
          id="local-video"
          autoPlay
          playsInline
          muted
          width={video.width}
          height={video.height}
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          width={video.width}
          height={video.height}
          className="w-full h-full object-cover"
        />
      </div>
      <ButtonComponent landmarks={landmarks} />
    </div>
  );
};

export default WebCamera;