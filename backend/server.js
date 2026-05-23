const express = require("express");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");
const multer = require("multer");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), {
      filename: "audio.webm",
      contentType: "audio/webm",
    });

    const response = await axios.post(
      "http://127.0.0.1:5001/transcribe",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
      }
    );

    fs.unlinkSync(filePath);

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "transcription failed" });
  }
});

app.listen(3000, () => {
  console.log("Express running on http://localhost:3000");
});
