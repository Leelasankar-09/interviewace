# 🚀 How to Run InterviewAce — Complete Guide

## 🌐 Frontend (React + Vite + TailwindCSS)

```powershell
cd C:\Users\sirig\Desktop\project\interviewace\frontend
npm run dev
# Opens at http://localhost:5173 (or 5174)
```

---

## 🐍 Backend (FastAPI + Python)

### Step 1 — Install Python 3.11+
Download from https://python.org

### Step 2 — Create virtual environment
```powershell
cd C:\Users\sirig\Desktop\project\interviewace\backend
python -m venv venv
.\venv\Scripts\activate
```

### Step 3 — Install dependencies
```powershell
pip install fastapi uvicorn python-multipart anthropic python-jose passlib bcrypt python-dotenv PyPDF2 python-docx
```

### Step 4 — Create .env file
Copy `.env.example` to `.env` and fill in:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
JWT_SECRET=any-long-random-string
```

### Step 5 — Run the backend
```powershell
uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

---

## 🐋 Docker (Recommended for Production Simulation)

Assuming you have Docker installed:

```powershell
docker-compose up --build
```
- Backend will be at: `http://localhost:8000`
- Frontend will be at: `http://localhost:3000`
- Redis & Postgres will be started automatically.

---

## 🤖 AI Features

### Getting an Anthropic API Key (for Claude AI questions)
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Create an API key
4. Add to `.env` as `ANTHROPIC_API_KEY=sk-ant-...`

### Features without API key (works offline):
- ✅ Voice recording + save
- ✅ Filler word detection (uhm/um/uh)
- ✅ Question generation (local bank)
- ✅ 8-parameter scoring
- ✅ All UI features

### Features that need API key:
- 🤖 Claude AI question generation
- 🤖 Resume ATS AI analysis
- 🤖 Code review AI feedback
- 🤖 Mock interview (AI interviewer)

---

## 🦜 Voice Recording — How it Works

1. Go to **Voice Eval** page → click 🎙️ red button
2. Allow microphone access in browser
3. Speak your answer
4. Click ⏹ to stop
5. Play back your recording
6. Click **Analyse** to get:
   - 8 parameter scores (radar chart)
   - **Uhm/Um detection** highlighted in red
   - Filler word count
   - Power word highlights
   - Annotated transcript

7. Click **Save Recording** → saves `.webm` file to `backend/recordings/`

---

## 📋 Feature Summary

| Page | Route | What it does |
|------|-------|--------------|
| Dashboard | `/dashboard` | Stats, charts, 70-day streak |
| DSA Practice | `/dsa` | Code editor + AI review |
| Behavioral | `/behavioral` | HR/STAR practice |
| System Design | `/system-design` | Design prompts |
| Mock Interview | `/mock` | Live AI interviewer |
| Voice Eval ⚡ | `/voice-eval` | Record, detect fillers, score |
| Resume ATS | `/resume` | Upload PDF → AI analysis |
| Question Gen 🤖 | `/questions` | Generate by role/type/level |
| Community | `/community` | Reddit-style forum |
| Roles | `/roles` | Roadmaps per career path |
| Platforms | `/platforms` | LeetCode/CF stats |
| Profile | `/profile` | Privacy-controlled profile |
