import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const API = process.env.REACT_APP_API_URL || '/api';

const QUICK_REPLIES = [
  'What\'s on the menu?',
  'Yenna price da?',
  'Where are you today?',
  'What time do you open?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Vanakkam! 🙏 Naan Sneka, Zing Bites-oda assistant! Enna help vennum bro? 😄' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }));
      const { data } = await axios.post(`${API}/ai/chat`, { message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Aiyo, kொஞ்சம் problem da! Try again panna 🙏' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`chatbot-widget ${open ? 'open' : ''}`}>
        <div className="chat-header" onClick={() => setOpen(!open)}>
          <div className="chat-avatar">🤖</div>
          <div className="chat-info">
            <span className="chat-name">Sneka AI</span>
            <span className="chat-status">● Online</span>
          </div>
          <button className="chat-close">{open ? '✕' : '💬'}</button>
        </div>

        {open && (
          <div className="chat-body">
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {m.role === 'assistant' && <span className="msg-avatar">🤖</span>}
                  <div className="msg-bubble">{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="chat-msg assistant">
                  <span className="msg-avatar">🤖</span>
                  <div className="msg-bubble typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="quick-replies">
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type in Tamil or English..."
              />
              <button onClick={() => sendMessage()} disabled={loading}>
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      {!open && (
        <button className="chatbot-fab" onClick={() => setOpen(true)}>
          💬
          <span className="fab-label">Chat</span>
        </button>
      )}
    </>
  );
}
