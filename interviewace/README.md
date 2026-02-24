<div align="center">

# 🎯 InterviewAce

**AI-powered interview preparation platform for engineering candidates**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> Practice DSA, behavioral, and system design interviews with real-time AI feedback, analytics, and leaderboards.

</div>

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure register/login with 30-day tokens |
| 🔑 **Forgot Password** | Secure token-based password reset flow |
| 💬 **Behavioral Interviews** | AI evaluates STAR structure, filler words & sentiment |
| 💻 **DSA Practice** | Problem bank with AI code review + complexity analysis |
| 🎭 **Mock Interviews** | End-to-end interview simulation with streaming AI |
| 🗣️ **Voice Evaluation** | Real-time speech analysis — pace, clarity, fillers |
| 📄 **Resume ATS Analyzer** | PDF/DOCX resume scored against job descriptions |
| 🏆 **Leaderboard** | Ranked by score + streak, filterable by college |
| 📊 **Analytics Dashboard** | Streak calendar, score trends, per-section breakdown |
| 👤 **Profile** | Name, college, CGPA, LinkedIn, GitHub — saved to DB |
| 📚 **History** | Paginated session history with trend charts |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone the repo
```bash
git clone https://github.com/Leela-Sankar-09/interviewace.git
cd interviewace
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Create .env file
echo JWT_SECRET=your-super-secret-key > .env
echo ANTHROPIC_API_KEY=sk-ant-... >> .env

python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd frontend
npm install

# Create .env file
echo VITE_API_URL=http://localhost:8000/api > .env

npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🏗️ Architecture

```
interviewace/
├── backend/
│   ├── main.py               # FastAPI app, CORS, startup
│   ├── database.py           # SQLAlchemy engine + Base
│   ├── models/
│   │   ├── user_model.py     # User (name, email, college, CGPA…)
│   │   ├── session_model.py  # InterviewSession, PracticeStreak
│   │   └── analytics_model.py
│   └── routers/
│       ├── auth.py           # JWT auth + forgot/reset password
│       ├── sessions.py       # Unified history & analytics
│       ├── leaderboard.py    # Ranked user board
│       ├── behavioral.py     # STAR + NLP evaluation
│       ├── dsa.py            # Problem bank + AI code review
│       ├── mock.py           # Full mock interview
│       ├── resume.py         # ATS scoring
│       └── profile.py        # User profile CRUD
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js      # Axios instance + auth interceptor
    │   │   └── services.js   # All API functions
    │   ├── store/
    │   │   ├── authStore.js  # Zustand auth state
    │   │   └── themeStore.js
    │   ├── pages/            # 15+ pages
    │   └── components/       # Sidebar, Topbar, charts
    └── vite.config.js
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (passlib)
- JWT tokens signed with HS256, configurable expiry
- Password reset tokens are cryptographically random, expire in **30 minutes**, and are single-use
- No sensitive data stored in localStorage — tokens only
- CORS restricted to known origins in production

---

## 🌐 Environment Variables

| Variable | Where | Description |
|---|---|---|
| `JWT_SECRET` | backend `.env` | Secret for signing JWTs |
| `ANTHROPIC_API_KEY` | backend `.env` | Claude AI API key |
| `VITE_API_URL` | frontend `.env` | Backend base URL |

---

## 📈 Roadmap

- [ ] Email integration for password reset (SMTP/SendGrid)
- [ ] Badge & achievement system
- [ ] PDF report export
- [ ] Peer mock interview matching
- [ ] Docker Compose for one-command deployment

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss the change.

---

## 📄 License

MIT © 2025 [Leela Sankar Reddy](https://github.com/Leela-Sankar-09)
