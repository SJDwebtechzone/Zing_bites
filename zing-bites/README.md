# 🚚 ZING BITES - Full Stack Food Truck Website

> **Fresh Food On Wheels** — Chennai's most loved food truck platform.  
> A complete production-ready full-stack web app with React, Node.js, MySQL, Razorpay, Gemini AI, and more.

---

## 📁 Project Structure

```
zing-bites/
├── backend/                 ← Node.js + Express API
│   ├── config/
│   │   └── db.js            ← MySQL connection pool
│   ├── middleware/
│   │   └── auth.js          ← JWT protect + adminOnly
│   ├── routes/
│   │   ├── auth.js          ← Register, Login, OTP, Verify
│   │   ├── products.js      ← Categories + Products CRUD
│   │   ├── orders.js        ← Razorpay + Order management
│   │   ├── misc.js          ← Location, Status, Contact, Stats
│   │   └── ai.js            ← Gemini Chatbot + Voice
│   ├── utils/
│   │   └── email.js         ← Nodemailer email templates
│   ├── schema.sql           ← Complete DB schema + seed data
│   ├── setupDb.js           ← One-time DB setup script
│   ├── server.js            ← Express app entry point
│   ├── .env.example         ← Environment variables template
│   └── package.json
│
├── frontend/                ← React.js SPA
│   ├── public/
│   │   └── index.html       ← HTML with Razorpay SDK
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js/.css
│   │   │   ├── Footer.js/.css
│   │   │   ├── OpeningAnimation.js/.css  ← Truck animation
│   │   │   ├── Chatbot.js/.css           ← Bilingual AI chatbot
│   │   │   └── VoiceAssistant.js/.css    ← Tamil voice AI
│   │   ├── context/
│   │   │   └── AuthContext.js   ← Global auth + cart state
│   │   ├── pages/
│   │   │   ├── Home.js/.css     ← Hero, categories, map, CTA
│   │   │   ├── Auth.js/.css     ← Login, Register, OTP verify
│   │   │   ├── Menu.js/.css     ← Product listing with filters
│   │   │   ├── Cart.js/.css     ← Cart + Razorpay checkout
│   │   │   ├── Orders.js/.css   ← Order history
│   │   │   ├── About.js/.css    ← Brand story, values, hours
│   │   │   ├── Contact.js/.css  ← Contact form + map
│   │   │   └── Admin.js/.css    ← Full admin dashboard
│   │   ├── styles/
│   │   │   └── globals.css      ← CSS variables + utilities
│   │   ├── App.js               ← Router + layout
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── package.json             ← Root scripts
└── README.md
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| npm | v9+ |
| MySQL | v8.0+ |
| Gmail account | For SMTP email |
| Razorpay account | Test/Live keys |
| Gemini API key | Google AI Studio |
| Google Maps API | (optional, for live map) |

---

## 🚀 Setup Instructions

### Step 1 — Clone & Install

```bash
# Install backend dependencies
cd zing-bites/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=zing_bites

# JWT Secret (use a long random string)
JWT_SECRET=make_this_very_long_and_random_string_123!
JWT_EXPIRE=7d

# Gmail SMTP
# ⚠️ Use App Password, not your Gmail password
# Go to: Google Account → Security → 2FA → App Passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASS=your_16char_app_password
ADMIN_EMAIL=admin@zingbites.com

# Razorpay (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Gemini API (get from aistudio.google.com)
GEMINI_API_KEY=AIzaSy_your_gemini_key_here

# Google Maps (optional, get from console.cloud.google.com)
GOOGLE_MAPS_API_KEY=AIzaSy_your_maps_key_here

FRONTEND_URL=http://localhost:3000
OTP_EXPIRE=10
```

---

### Step 3 — Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
REACT_APP_GOOGLE_MAPS_KEY=AIzaSy_your_maps_key_here
```

---

### Step 4 — Set Up Database

```bash
# Make sure MySQL is running, then:
cd backend
node setupDb.js
```

This will:
- Create `zing_bites` database
- Create all 8 tables
- Insert 4 categories + 20 menu items
- Create default admin user
- Set default location (T. Nagar, Chennai)

**Default Admin Login:**
- Email: `admin@zingbites.com`
- Password: `Admin@123`

---

### Step 5 — Run the App

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server runs at: http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
# App opens at: http://localhost:3000
```

---

## 🌟 Features Overview

### 🎬 Opening Animation
- Full-screen food truck drives left → right
- Smoke effects, spinning wheels
- Brand reveal animation
- Smooth fade into homepage
- Only shows once per session

### 🏠 Homepage
- Dark-to-light hero with animated 3D CSS truck
- Floating food emojis background
- Real-time open/closed status
- 4 category cards
- Live location map (Google Maps embed)
- Why choose us section
- CTA section

### 🔐 Authentication (OTP-based)
- Register with Name, Email, Phone, Password
- OTP sent via email (valid 10 min)
- 6-box OTP input UI
- JWT token stored in localStorage
- Login redirects unverified users to OTP screen

### 📋 Menu Page (Auth Required)
- All 20+ items displayed
- Filter by 4 categories
- Search bar
- Veg/Non-veg indicators
- Spice level badges
- Add to cart / quantity control
- "Not Available" for disabled items

### 🛒 Cart & Checkout
- Real-time cart with quantities
- Special instructions field
- ₹10 platform fee
- Razorpay payment gateway
  - UPI, Cards, Netbanking, Wallets
- Order saved to DB on payment success
- Confirmation email sent automatically

### 📦 Order History
- View all past orders
- Order status tracking (pending → delivered)
- Payment status badges
- Item breakdown per order

### 📖 About Page
- Brand story of Zing Bites
- Mission & Vision cards
- 4 Signature dishes showcase
- Core values grid
- Operating hours (all 7 days)
- Contact info cards
- Floating food animations

### 📞 Contact Page
- 4 contact method cards (Phone, Email, Location, WhatsApp)
- Animated form with validation
- Google Maps embed
- Success/error messages
- Admin email notification on submit
- Message saved to database

### 🤖 AI Chatbot (Bottom Left)
- Powered by Gemini API
- Bilingual: Tamil + English (Tanglish)
- Quick reply buttons
- Typing animation
- Persistent chat session
- Responds as "Sneka" with Tamil slang

### 🎤 Voice Assistant (Bottom Right)
- Tamil speech recognition (Web Speech API)
- Responds via browser Text-to-Speech (Tamil voice)
- Gemini AI processes voice queries
- Visual recording animation with ripple rings
- Shows transcript + response text
- Sample phrase suggestions

### 🗺️ Live Location
- Admin can update truck coordinates from dashboard
- Quick preset buttons for Chennai areas
- Google Maps iframe embed on homepage + contact
- Area name shown in status

### 👨‍💼 Admin Dashboard
- **Dashboard Tab**: Stats cards, truck open/close toggle
- **Orders Tab**: Full order table with status dropdown
- **Products Tab**: Toggle item availability on/off
- **Location Tab**: Update coordinates + quick presets
- **Messages Tab**: View contact messages, mark as read
- Unread message badge on nav

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile (protected) |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products/categories` | All categories (public) |
| GET | `/api/products` | All products (protected) |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products` | Add product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| PATCH | `/api/products/:id/toggle` | Toggle availability (admin) |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders/create-payment` | Create Razorpay order |
| POST | `/api/orders/verify-payment` | Verify payment |
| GET | `/api/orders/my-orders` | User's orders |
| GET | `/api/orders/all` | All orders (admin) |
| PATCH | `/api/orders/:id/status` | Update status (admin) |

### Truck / Misc
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/truck/status` | Truck open/closed status |
| PATCH | `/api/truck/status` | Update status (admin) |
| GET | `/api/truck/location` | Current location |
| PUT | `/api/truck/location` | Update location (admin) |
| POST | `/api/truck/contact` | Submit contact message |
| GET | `/api/truck/contact/messages` | All messages (admin) |
| GET | `/api/truck/admin/stats` | Dashboard stats (admin) |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/chat` | Chatbot message |
| POST | `/api/ai/voice` | Voice query |

---

## 🔒 Security Notes

- `.env` files are NOT included — copy from `.env.example`
- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (10 rounds)
- OTPs expire in 10 minutes
- Admin routes protected with `adminOnly` middleware
- CORS configured for frontend URL only
- Never commit `.env` to git!

---

## 📱 Responsive Breakpoints

| Device | Breakpoint |
|--------|-----------|
| Mobile | < 480px |
| Tablet | 480px – 768px |
| Laptop | 768px – 1024px |
| Desktop | > 1024px |

All pages fully responsive for Android, iOS, tablet, and desktop.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#FF6B35` (Orange) |
| Primary Dark | `#e5531d` |
| Accent | `#FFB703` (Yellow) |
| Dark BG | `#1a1a2e` |
| Text | `#2d2d2d` |
| Font Display | Syne (headings) |
| Font Body | Plus Jakarta Sans |
| Border Radius | 16px (cards), 50px (pills) |

---

## 🚀 Production Deployment

### Backend (Railway / Render / VPS)
```bash
NODE_ENV=production
# Update CORS origin to your frontend domain
FRONTEND_URL=https://yourdomain.com
```

### Frontend (Vercel / Netlify)
```bash
REACT_APP_API_URL=https://your-backend.com/api
```

Add `public/_redirects` for Netlify:
```
/*  /index.html  200
```

---

## 📞 Support

**Zing Bites** — Fresh Food On Wheels  
📍 Chennai, Tamil Nadu  
📞 +91 98765 43210  
✉️ hello@zingbites.com  
🕕 Daily 6:00 PM – 11:00 PM
