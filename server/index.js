import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import googleTTS from "google-tts-api";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎧 ReVoice backend running successfully!");
});

// 🎙️ Text-to-Speech API route (now returns audio directly)
app.post("/api/speak", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text is required!" });
  }

  try {
    // Get the TTS URL
    const url = googleTTS.getAudioUrl(text, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com",
    });

    console.log("Generated TTS URL:", url);

    // Fetch the audio data as a buffer
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const audioBuffer = Buffer.from(response.data, "binary");

    // Send it as MP3 audio file
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Text-to-Speech conversion failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
