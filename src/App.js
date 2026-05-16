import { useState, useRef, useCallback } from "react";
import "./App.css";

const LANGUAGES = [
  { code: "auto", label: "Detect Language" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "tr", label: "Turkish" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "sv", label: "Swedish" },
  { code: "el", label: "Greek" },
  { code: "he", label: "Hebrew" },
  { code: "th", label: "Thai" },
  { code: "vi", label: "Vietnamese" },
  { code: "id", label: "Indonesian" },
  { code: "uk", label: "Ukrainian" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ur", label: "Urdu" },
  { code: "fa", label: "Persian" },
  { code: "sw", label: "Swahili" },
];

const TARGET_LANGUAGES = LANGUAGES.filter((l) => l.code !== "auto");
const langLabel = (code) => LANGUAGES.find((l) => l.code === code)?.label ?? code;

export default function App() {
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const debounceRef = useRef(null);

const translate = useCallback(async (text, src, tgt) => {
    if (!text.trim()) {
      setTranslatedText("");
      setDetectedLang("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const sourceLangCode = src === "auto" ? "" : src;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLangCode}|${tgt}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const translated = data.responseData?.translatedText ?? "";
      const detected = data.responseData?.detectedLanguage ?? "";
      
      setTranslatedText(translated);
      if (src === "auto" && detected) {
        setDetectedLang(detected);
      } else {
        setDetectedLang("");
      }
    } catch (e) {
      setError("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);
    setCharCount(val.length);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      translate(val, sourceLang, targetLang);
    }, 2000);
  };

  const handleLangChange = (src, tgt) => {
    clearTimeout(debounceRef.current);
    translate(inputText, src, tgt);
  };

  const handleSwap = () => {
    if (sourceLang === "auto") return;
    const newSrc = targetLang;
    const newTgt = sourceLang;
    const newInput = translatedText;
    setSourceLang(newSrc);
    setTargetLang(newTgt);
    setInputText(newInput);
    setCharCount(newInput.length);
    setTranslatedText("");
    setDetectedLang("");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      translate(newInput, newSrc, newTgt);
    }, 300);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpeak = () => {
    if (!translatedText || !window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(translatedText);
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) =>
      v.lang.toLowerCase().startsWith(targetLang.split("-")[0])
    );
    if (match) utt.voice = match;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  };

  const handleClear = () => {
    setInputText("");
    setTranslatedText("");
    setDetectedLang("");
    setCharCount(0);
    clearTimeout(debounceRef.current);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Language Translator</h1>
          <p>Auto-detects source language · 30+ languages</p>
        </div>

        <div className="lang-bar">
          <select
            value={sourceLang}
            onChange={(e) => {
              setSourceLang(e.target.value);
              handleLangChange(e.target.value, targetLang);
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button
            className="swap-btn"
            onClick={handleSwap}
            disabled={sourceLang === "auto"}
            title="Swap languages"
          >
            ⇄
          </button>

          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              handleLangChange(sourceLang, e.target.value);
            }}
          >
            {TARGET_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="panels">
          <div className="panel input-panel">
            <div className="panel-header">
              <span>{sourceLang === "auto" ? "Source text" : langLabel(sourceLang)}</span>
              {inputText && (
                <button className="clear-btn" onClick={handleClear}>Clear</button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={handleInput}
              placeholder="Type or paste text to translate..."
              maxLength={3000}
            />
            <div className="panel-footer">
              <span className="char-count">{charCount} / 3000</span>
            </div>
          </div>

          <div className="panel output-panel">
            <div className="panel-header">
              <span>
                {langLabel(targetLang)}
                {detectedLang && (
                  <span className="detected-badge">Detected: {detectedLang}</span>
                )}
              </span>
              <div className="action-btns">
                <button
                  className="icon-btn"
                  onClick={handleSpeak}
                  disabled={!translatedText}
                  title="Read aloud"
                >
                  🔊
                </button>
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                  disabled={!translatedText}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="output-body">
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <span>Translating...</span>
                </div>
              ) : error ? (
                <p className="error">{error}</p>
              ) : translatedText ? (
                <p className="translated-text">{translatedText}</p>
              ) : (
                <p className="placeholder">Translation will appear here…</p>
              )}
            </div>
          </div>
        </div>

        <p className="footer-note">
          Translation updates automatically as you type
        </p>
      </div>
    </div>
  );
}