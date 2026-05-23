import { useEffect, useState } from 'react';

import { MicIcon } from 'lucide-react';

function App() {
  const [recording, setRecording] = useState(false);

  const handleStart = async () => {
    chrome.runtime.sendMessage({
      type: "START_RECORDING"
    });
    setRecording(true);
  };

  const handleStop = async () => {
    chrome.runtime.sendMessage({
      type: "STOP_RECORDING"
    });
    setRecording(false);
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_STATE" });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "STATE") {
        setRecording(msg.isRecording);
      }
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .catch(function() {
            chrome.tabs.create({
                url: chrome.runtime.getURL("recorder.html"),
                selected: true
            })
        });
    }, 100);
  }, []);

  return (
    <div className="w-20 h-20 flex items-center justify-center bg-black">
      <MicIcon
        key={recording ? "1" : "0"}
        className="cursor-pointer"
        size={40}
        color={recording ? "#ff0000" : "#ffffff"}
        onClick={async () => {
          if (recording) {
            await handleStop();
          } else {
            await handleStart();
          }

          setRecording(!recording);
        }}
      />
    </div>
  );
}

export default App;
