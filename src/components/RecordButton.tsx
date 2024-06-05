import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { client } from "../websocketService/websocketService";

const RecordButtonComponent = ({ landmarks }: { landmarks: any[] }) => {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        invoke<string>("record_landmarks", { landmarks })
          .then((value) => {
            console.log(value);
          })
          .catch((err) => {
            console.error("Failed to record landmarks", err);
          });
      }, 1000 / 30);
    }
    return () => clearInterval(interval);
  }, [recording, landmarks]);

  const onRecordingClick = () => {
    invoke<string>("on_recording_clicked")
      .then((value) => {
        console.log(value);
        if (recording) {
          const name = prompt("Enter recording name:");
          if (name) {
            invoke<string>("save_recording", { filename: name })
              .then((filePath) => {
                console.log("Recording saved at:", filePath);
                client.send(JSON.stringify({"function": "add", "args": [filePath, name]}))
              })
              .catch((err) => {
                console.error("Failed to save recording", err);
              });

          }
        }
        setRecording(!recording);
      })
      .catch((err) => {
        console.error("Failed to invoke Rust command 'on_recording_clicked'", err);
      });
  };

return (
    <div className="flex justify-around items-center w-full h-20 bg-gray-100 absolute bottom-0">
        <button
            onClick={onRecordingClick}
            className={`font-bold py-2 px-4 rounded transition ease-in-out duration-300 flex-1 mx-2 ${
                recording ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            } hover:opacity-80 hover:shadow-md`}
        >
            {recording ? "Stop Recording" : "Start Recording"}
        </button>
    </div>
);
};

export default RecordButtonComponent;