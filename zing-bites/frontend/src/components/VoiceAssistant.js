import React, { useState, useRef } from 'react';
import axios from 'axios';
import './VoiceAssistant.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser. Please use Chrome.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'ta-IN';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => { setListening(true); setStatus('listening'); setTranscript(''); setResponse(''); };
    recognitionRef.current.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setStatus('thinking');
      setListening(false);
      await getAIResponse(text);
    };
    recognitionRef.current.onerror = () => { setListening(false); setStatus('idle'); };
    recognitionRef.current.onend = () => { if (status === 'listening') setStatus('idle'); };
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const getAIResponse = async (text) => {
    try {
      const { data } = await axios.post(`${API}/ai/voice`, { transcript: text });
      setResponse(data.reply);
      setStatus('speaking');
      speak(data.reply);
    } catch {
      setResponse('Aiyo, problem da! Try again panna.');
      setStatus('idle');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(v => v.lang.startsWith('ta')) || voices.find(v => v.lang.startsWith('en-IN'));
    if (tamilVoice) utterance.voice = tamilVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => { setSpeaking(false); setStatus('idle'); };
    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (listening) { stopListening(); return; }
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); setStatus('idle'); return; }
    startListening();
  };

  return (
    <>
      <div className={`voice-widget ${open ? 'open' : ''}`}>
        {open && (
          <div className="voice-panel">
            <div className="voice-header">
              <div className="voice-avatar">🎤</div>
              <div>
                <div className="voice-name">அனேகா (Sneka)</div>
                <div className="voice-desc">Tamil Voice Assistant</div>
              </div>
              <button className="voice-x" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="voice-body">
              <div className={`mic-circle ${status}`} onClick={handleMicClick}>
                <div className="mic-rings">
                  <div className="ring r1"></div>
                  <div className="ring r2"></div>
                  <div className="ring r3"></div>
                </div>
                <span className="mic-icon">
                  {status === 'listening' ? '🎙️' : status === 'thinking' ? '🤔' : status === 'speaking' ? '🔊' : '🎤'}
                </span>
              </div>

              <p className="voice-status-text">
                {status === 'idle' && 'Mic click panna, Tamil-la pesalaam! 🎤'}
                {status === 'listening' && 'Kekuthu irukken... 👂'}
                {status === 'thinking' && 'Yosikuthu irukken... 🤔'}
                {status === 'speaking' && 'Pesuthu irukken... 🔊'}
              </p>

              {transcript && (
                <div className="voice-transcript">
                  <span className="label">நீங்கள் சொன்னது:</span>
                  <p>"{transcript}"</p>
                </div>
              )}

              {response && (
                <div className="voice-response">
                  <span className="label">அனேகா சொல்கிறாள்:</span>
                  <p>{response}</p>
                </div>
              )}

              <div className="voice-tips">
                <p>Try saying:</p>
                <span>"Menu enna da?"</span>
                <span>"Enge irukku truck?"</span>
                <span>"Burger price?"</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <button className={`voice-fab ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
        🎤
        {!open && <span className="voice-fab-label">Voice</span>}
      </button>
    </>
  );
}
