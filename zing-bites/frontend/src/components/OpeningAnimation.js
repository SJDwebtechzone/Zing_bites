import React, { useEffect, useState } from 'react';
import './OpeningAnimation.css';

export default function OpeningAnimation({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter → pause → exit → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('pause'), 1200);
    const t2 = setTimeout(() => setPhase('exit'), 2000);
    const t3 = setTimeout(() => onComplete(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`opening-overlay ${phase === 'exit' ? 'fade-out' : ''}`}>
      <div className="opening-bg">
        <div className="road">
          <div className="road-line"></div>
          <div className="road-line"></div>
          <div className="road-line"></div>
        </div>

        <div className={`truck-container phase-${phase}`}>
          {/* Smoke */}
          <div className="smoke-container">
            <div className="smoke s1"></div>
            <div className="smoke s2"></div>
            <div className="smoke s3"></div>
          </div>

          {/* Truck SVG */}
          <svg className="truck-svg" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
            {/* Truck body */}
            <rect x="10" y="30" width="220" height="85" rx="8" fill="#FF6B35"/>
            {/* Cab */}
            <rect x="200" y="20" width="100" height="95" rx="8" fill="#e5531d"/>
            {/* Window */}
            <rect x="215" y="30" width="60" height="45" rx="6" fill="#87CEEB" opacity="0.9"/>
            <rect x="240" y="30" width="2" height="45" fill="white" opacity="0.5"/>
            {/* Brand text area */}
            <rect x="20" y="45" width="200" height="55" rx="6" fill="rgba(0,0,0,0.15)"/>
            {/* ZING text */}
            <text x="115" y="70" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">ZING</text>
            <text x="115" y="92" textAnchor="middle" fill="#FFB703" fontSize="14" fontWeight="bold" fontFamily="Arial">BITES 🚚</text>
            {/* Wheels */}
            <circle cx="65" cy="118" r="18" fill="#1a1a2e"/>
            <circle cx="65" cy="118" r="10" fill="#555"/>
            <circle cx="65" cy="118" r="5" fill="#FFB703"/>
            <circle cx="230" cy="118" r="18" fill="#1a1a2e"/>
            <circle cx="230" cy="118" r="10" fill="#555"/>
            <circle cx="230" cy="118" r="5" fill="#FFB703"/>
            {/* Wheel spokes */}
            <line x1="55" y1="118" x2="75" y2="118" stroke="#FFB703" strokeWidth="2" className="spoke"/>
            <line x1="65" y1="108" x2="65" y2="128" stroke="#FFB703" strokeWidth="2" className="spoke"/>
            <line x1="220" y1="118" x2="240" y2="118" stroke="#FFB703" strokeWidth="2" className="spoke"/>
            <line x1="230" y1="108" x2="230" y2="128" stroke="#FFB703" strokeWidth="2" className="spoke"/>
            {/* Undercarriage */}
            <rect x="5" y="110" width="305" height="6" rx="3" fill="#c0392b"/>
            {/* Exhaust pipe */}
            <rect x="295" y="60" width="8" height="35" rx="4" fill="#666"/>
            {/* Headlights */}
            <ellipse cx="307" cy="85" rx="6" ry="8" fill="#FFD700" opacity="0.9"/>
            <ellipse cx="307" cy="85" rx="6" ry="8" fill="yellow" opacity="0.4" filter="blur(2px)"/>
            {/* Door handle */}
            <rect x="250" y="70" width="15" height="4" rx="2" fill="white" opacity="0.7"/>
          </svg>
        </div>

        {/* Brand tagline */}
        <div className={`brand-reveal ${phase !== 'enter' ? 'show' : ''}`}>
          <h1>🚚 Zing Bites</h1>
          <p>Fresh Food On Wheels · Chennai</p>
        </div>

        {/* Food emojis */}
        <div className="floating-foods">
          {['🍔', '🌮', '🍟', '🌶️', '🍕', '🥙'].map((emoji, i) => (
            <span key={i} className={`food-emoji fe-${i}`}>{emoji}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
