# 🚀 How to Run InterviewAce — Complete Guide

Follow these steps to launch the **InterviewAce** platform on your Windows machine.

---

## 🐋 Docker Setup (Recommended One-Command Launch)

Assuming you have **Docker Desktop** installed and running:

1. **Configure Environment:**
   ```bash
   # In the root folder (C:\Users\sirig\Desktop\project)
   copy .env.example .env
   # Open .env and add your ANTHROPIC_API_KEY
   ```

2. **Launch everything:**
   ```bash
   docker-compose up --build
   ```

- **App:** [http://localhost:5173](http://localhost:5173)
- **API Backend:** [http://localhost:8000](http://localhost:8000)
- **Redis & Postgres:** Started automatically in containers.

---

## 🌐 Manual Setup (Local Development)

### 🐘 Backend (FastAPI + Python)

1. **Step 1 — Create virtual environment:**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Step 2 — Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Step 3 — Run the backend:**
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
   *API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### ⚛️ Frontend (React + Vite + TailwindCSS)

1. **Step 1 — Install dependencies:**
   ```powershell
   cd frontend
   npm install
   ```

2. **Step 2 — Launch development server:**
   ```powershell
   npm run dev
   ```
   *Opens at: [http://localhost:5173](http://localhost:5173)*

---

## 🤖 AI Features & API Keys

### Anthropic API Key (Claude)
1. Get a key from [console.anthropic.com](https://console.anthropic.com).
2. Add to `.env` as `ANTHROPIC_API_KEY=sk-ant-...`.

### What works WITHOUT an API Key (Local Logic):
- 🔐 Secure JWT Login / Registration.
- 🎙️ Voice recording and playback.
- 🔴 Oh/Uhm/Uh filler word detection (Local NLP).
- 📋 Interview Application Tracker (Kanban).
- 👥 Community Forum & Discussion.
- 📊 Dashboard Stats & Streak Tracking.

### What REQUIRES an AI Key (Claude Integration):
- 🤖 AI Mock Interviewer (Conversational simulation).
- 💻 Expert Code Review (DSA complexity analysis).
- 🏛️ System Design Tradeoff Evaluation.
- 📄 Resume ATS Scoring & Feedback.
- 🏢 Company Deep-Dive Insights.

---

## 📋 Project Directory Structure

```
interviewace/
├── frontend/         # React Application (src/pages, src/components)
├── backend/          # FastAPI Framework (MVC Pattern)
│   ├── app/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Database schemas
│   │   └── services/     # AI & External connections
├── infra/            # Nginx & Infrastructure configs
└── docker-compose.yml
```

---
Happy Practicing! 🎯
