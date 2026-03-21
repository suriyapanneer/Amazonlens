# AmazonLens v3 — Amazon India Product Intelligence

A local-first product research tool for Amazon India sellers. Upload Helium 10 exports, analyse markets, find sellable products, and calculate real profits.

## Features
- 📊 **Xray Upload** — Market stats, opportunity score, competitor moat analysis
- 🔍 **Cerebro Upload** — Keyword tiers (Zero Comp, Gold, Silver, Bronze)
- 📦 **Black Box Upload** — Category-level product research
- 🗄️ **Products Database** — SQLite, no duplicates, upsert on re-upload
- 🎯 **Sellable Products** — Automatically filtered table with scoring
- ⚡ **Multi-Select Comparison** — Side-by-side up to 5 products
- 💰 **Profit Calculator** — Manual + auto-fill from saved product, full fee breakdown
- 🔮 **12-Month Forecast** — 3 scenarios with cumulative table
- ↓ **CSV Export** — Every table is exportable

## Local Setup

### 1. Backend (run first)
```bash
cd amazonlens/backend
npm install
node server.js
# ✅ Must show: AmazonLens API v2 on http://localhost:4000
```

### 2. Frontend (new terminal)
```bash
cd amazonlens/frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Verify backend
```bash
curl http://localhost:4000
# Should return: {"status":"AmazonLens API v2 ✅"}
```

## Deployment (Free)
1. Push to GitHub
2. **Backend → Render.com**: Root = `backend`, Build = `npm install`, Start = `node server.js`
3. **Frontend → Vercel.com**: Root = `frontend`, Framework = Vite, Env = `VITE_API_URL=https://YOUR.onrender.com/api`

## Tech Stack
- Frontend: React 18 + Vite + Recharts
- Backend: Node.js + Express + better-sqlite3
- Fonts: Sora + DM Sans + DM Mono (Google Fonts)
