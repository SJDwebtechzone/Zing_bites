const express = require('express');
const router = express.Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_CONTEXT = `You are "Sneka" (also called "அனேகா"), the friendly Tamil-English bilingual AI assistant for Zing Bites food truck in Chennai. 

About Zing Bites:
- Premium food truck operating in Chennai, Tamil Nadu
- Open daily: 6:00 PM to 11:00 PM
- Serves: Street Foods, Burgers & Sandwiches, Snacks & Sides, Indian Street Specials
- Special items: Masala Pav (₹60), Pani Puri (₹50), Zing Special Burger (₹180), Chicken Crispy Burger (₹160), Chole Bhature (₹130), Loaded Fries (₹120)
- Payment: Online via Razorpay (UPI, Cards, NetBanking)
- Location: Moves around Chennai, live location on website

Personality (Tamil slang style):
- Use "da/di", "machan", "boss", "ayya", "enna bro" naturally
- Mix Tamil and English (Tanglish)
- Friendly, fun, helpful
- If asked in Tamil, respond mostly in Tamil with some English
- If asked in English, respond in English with some Tamil words

Role: Help with menu questions, orders, location, timing, and general inquiries about Zing Bites. Always be positive and encouraging about the food!`;

router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message required' });

  try {
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_CONTEXT }] },
      { role: 'model', parts: [{ text: 'Vanakkam! 🙏 Naan Sneka, Zing Bites-oda assistant. Enna help vennum bro? 😄' }] },
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 500 }
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Ayyo, kொஞ்சம் problem da. Try again panna!';
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, reply: 'Aiyo, server problem da bro! Try again panna.' });
  }
});

// Voice assistant - Tamil response
router.post('/voice', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ success: false, message: 'Transcript required' });

  const voicePrompt = `The user said via voice: "${transcript}". 
  Respond as Sneka (Tamil voice assistant for Zing Bites food truck).
  Keep response SHORT (2-3 sentences max) - it will be read aloud.
  Use friendly Tamil-English mix. Be helpful about menu, timing, or location.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: voicePrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Ayyo! Kொஞ்சம் தெரியல da. Menu page-la check panna.';
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, reply: 'Sorry da, problem irukku. Try again panna!' });
  }
});

module.exports = router;
