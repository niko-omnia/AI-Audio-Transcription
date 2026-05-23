let recorder: any = null;
let stream: any = null;

let chunks: Blob[] = [];

async function start() {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus"
    });

    recorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };

    recorder.start();
}

async function stop(): Promise<void> {
    if (!recorder) return;

    const finalBlob = await new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
            const blob = new Blob(chunks, {
                type: "audio/webm;codecs=opus"
            });

            chunks = [];
            resolve(blob);
        };

        recorder.stop();
    });

    stream?.getTracks().forEach((t: any) => t.stop());
    recorder = null;
    stream = null;

    const form = new FormData();
    form.append("file", finalBlob, "audio.webm");

    const res = await fetch("http://localhost:3000/transcribe", {
        method: "POST",
        body: form
    });

    const data = await res.json();

    chrome.runtime.sendMessage({
        type: "TRANSCRIBED_TEXT",
        text: data.text
    });
}

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === "OFFSCREEN_START") start();
    if (msg.type === "OFFSCREEN_STOP") await stop();
});

export { };
