from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import tempfile
import os

app = FastAPI()

# Models: "tiny", "base", "small", "medium", "large-v3"
model = WhisperModel("base", device="cpu", compute_type="int8")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    
    tmp_path = None

    try:
        fd, tmp_path = tempfile.mkstemp(suffix=".webm")

        with os.fdopen(fd, "wb") as f:
            f.write(audio_bytes)

        segments, info = model.transcribe(tmp_path, vad_filter=False)

        text = "".join([segment.text for segment in segments])

        return {
            "text": text,
            "language": info.language
        }

    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
