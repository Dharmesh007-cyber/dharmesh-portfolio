# 🚀 Portfolio + AI Contact Pipeline

A full-stack portfolio website with a Gemini 1.5 Flash-powered inbox that automatically scores, analyzes, and surfaces the most valuable contact messages.

---

## Features

- **Stunning portfolio** — Dark editorial design with skills, projects, experience, and contact form
- **AI-powered inbox** — Every incoming message is analyzed by Gemini 1.5 Flash
- **Opportunity scoring** — Messages scored 0–100 based on career value
- **Smart prioritization** — High / Normal / Low priority auto-assigned
- **Insights & tags** — AI extracts key info and action items
- **Reply suggestions** — Gemini tells you how to best respond
- **Admin dashboard** — Beautiful inbox UI at `/inbox.html`
- **Rate limiting** — 5 messages per hour per IP to prevent spam
- **JSON storage** — Zero-config, no database needed

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
GEMINI_API_KEY=your_key_here   # Get free at https://aistudio.google.com/app/apikey
ADMIN_TOKEN=your_secret_token  # Change this! Used to access /inbox.html
PORT=3000
```

### 3. Customize your portfolio

Edit `frontend/index.html`:
- Replace `Your Name` / `YN` with your actual name
- Update the hero description, stats
- Edit skills, projects, experience sections
- Update contact info (email, GitHub, LinkedIn)

### 4. Start the server

```bash
npm start
```

Your portfolio: **http://localhost:3000**
Your inbox:     **http://localhost:3000/inbox.html**

---

## How the AI Pipeline Works

```
Visitor fills contact form
         ↓
POST /api/contact
         ↓
Message saved immediately (you get instant confirmation)
         ↓
Gemini 1.5 Flash analyzes in background:
  - Opportunity score (0-100)
  - Priority (high/normal/low)
  - Tags (job offer, freelance, spam, etc.)
  - 2-3 key insights
  - Reply strategy hint
  - Sentiment analysis
         ↓
Results saved and visible in admin inbox
         ↓
You open /inbox.html → sorted by score → focus on what matters
```

---

## Getting a Free Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy and paste into your `.env` file

**Gemini 1.5 Flash is free** with generous rate limits (15 RPM, 1M tokens/day on free tier).

---

## Project Structure

```
portfolio/
├── frontend/
│   ├── index.html        ← Main portfolio page
│   └── inbox.html        ← Admin inbox dashboard
├── backend/
│   ├── server.js         ← Express server
│   ├── routes/
│   │   ├── contact.js    ← Contact form API
│   │   └── inbox.js      ← Inbox admin API
│   ├── services/
│   │   ├── gemini.js     ← Gemini AI analysis
│   │   └── storage.js    ← JSON file storage
│   └── data/
│       └── messages.json ← Stored messages (auto-created)
├── .env.example
├── package.json
└── README.md
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/contact | None | Submit contact message |
| GET | /api/inbox | Token | List all messages |
| GET | /api/inbox/:id | Token | Get single message |
| PATCH | /api/inbox/:id | Token | Update (mark read/starred) |
| DELETE | /api/inbox/:id | Token | Delete message |
| GET | /api/inbox/stats/overview | Token | Stats summary |

Auth: send `x-admin-token: your_token` header, or `?token=your_token` query param.

---

## Customization Tips

**Change your name/initials:** Search for `YN` and `Your Name` in `index.html`

**Add more projects:** Copy a `.project-card` div and update the content

**Add real profile photo:** Replace the `.avatar-initials` div with an `<img>` tag

**Production deployment:** Use PM2 or Docker; add nginx reverse proxy; switch JSON storage to SQLite or PostgreSQL for production scale

---

Built with: Node.js · Express · Gemini 1.5 Flash · Vanilla JS · CSS
