import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [paragraphs, setParagraphs] = useState([]);
  const [repeatCounts, setRepeatCounts] = useState([]);
  const [wholeEssayRepeat, setWholeEssayRepeat] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 🔊 Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (!selectedVoice && availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  // ✂️ Split text into paragraphs
  const splitParagraphs = () => {
    const parts = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    setParagraphs(parts);
    setRepeatCounts(parts.map(() => 1));
  };

  // 🔁 Change paragraph repeat count
  const handleRepeatChange = (index, value) => {
    const updated = [...repeatCounts];
    updated[index] = value === "" ? "" : Math.max(1, parseInt(value, 10) || 1);
    setRepeatCounts(updated);
  };

  // 🔁 Change whole essay repeat count
  const handleWholeEssayRepeatChange = (value) => {
    setWholeEssayRepeat(value === "" ? "" : Math.max(1, parseInt(value, 10) || 1));
  };

  // 🎙️ Speak text using selected voice
  const speakText = (textToSpeak) =>
    new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.voice = selectedVoice;
      utterance.rate = speed;
      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });

  // ▶️ Speak all paragraphs with repeat logic
  const handleSpeakAll = async () => {
    if (isSpeaking || paragraphs.length === 0) return;
    setIsSpeaking(true);

    for (let essay = 0; essay < wholeEssayRepeat; essay++) {
      for (let i = 0; i < paragraphs.length; i++) {
        const repeatCount = repeatCounts[i] || 1;
        for (let r = 0; r < repeatCount; r++) {
          await speakText(paragraphs[i]);
        }
      }
    }

    alert("✅ Finished speaking all paragraphs!");
    setIsSpeaking(false);
  };

  // ⏹️ Stop speaking
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="app-container">
      <h1 className="title">
        🎧 ReVoice — <span>Study on the Go</span>
      </h1>

      <textarea
        className="text-input"
        placeholder="Paste your study notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
      />

      <button onClick={splitParagraphs} className="btn primary">
        ✂️ Split Paragraphs
      </button>

      {paragraphs.length > 0 && (
        <div className="paragraph-settings">
          <h3>⚙️ Repeat Settings</h3>
          {paragraphs.map((p, index) => (
            <div key={index} className="paragraph-item">
              <strong>Paragraph {index + 1}:</strong>{" "}
              <em>{p.substring(0, 50)}...</em>
              <input
                type="number"
                min="1"
                value={repeatCounts[index]}
                onChange={(e) => handleRepeatChange(index, e.target.value)}
                className="repeat-input"
              />
            </div>
          ))}

          <div className="paragraph-item">
            <strong>🔁 Repeat Whole Essay:</strong>
            <input
              type="number"
              min="1"
              value={wholeEssayRepeat}
              onChange={(e) => handleWholeEssayRepeatChange(e.target.value)}
              className="repeat-input"
            />
          </div>
        </div>
      )}

      <div className="voice-settings">
        <h3>🗣️ Voice & Speed</h3>
        <select
          value={selectedVoice?.name || ""}
          onChange={(e) =>
            setSelectedVoice(voices.find((v) => v.name === e.target.value))
          }
        >
          {voices.map((voice, i) => (
            <option key={i} value={voice.name}>
              {voice.name} — {voice.lang}
            </option>
          ))}
        </select>

        <div className="speed-control">
          <h4>🎚️ Speed: {speed.toFixed(2)}×</h4>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="bottom-controls">
        <button onClick={handleSpeakAll} disabled={isSpeaking} className="btn primary">
          ▶️ Speak
        </button>
        <button onClick={handleStop} disabled={!isSpeaking} className="btn danger">
          ⏹️ Stop
        </button>
      </div>
    </div>
  );
}

export default App;
