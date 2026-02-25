# 🎯 InterviewAce - Production Ready AI Interview Platform

**InterviewAce** is a professional-grade, full-stack AI-powered platform designed to prepare engineering candidates for top-tier tech interviews. Leveraging **FastAPI**, **React**, and **Anthropic Claude 3.5 Sonnet**, it provides real-time, deep technical and behavioral evaluations.

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| 🎙️ **Behavioral Lab** | STAR methodology analysis with real-time Speech-to-Text (STT) support. |
| 💻 **DSA Console** | Monaco Editor integration with AI-powered code review and complexity analysis. |
| 🏛️ **System Design** | Architecture tradeoff evaluations and deep technical vetting. |
| 📄 **Resume ATS** | Industrial-strength parser to score and optimize your resume for recruiters. |
| 📊 **Analytics** | Detailed 12-parameter scoring, streak tracking, and skill radar charts. |
| 📋 **Interview Tracker** | Full Kanban pipeline to manage your applications from "Applied" to "Offer". |
| 🗣️ **Vocab Coach** | AI sentence tuner to upgrade your technical and leadership vocabulary. |
| 🏢 **Company Prep** | Data-driven insights into the interview patterns of top tech firms (FAANG). |
| 👥 **Forum** | Reddit-style technical discussion and experience-sharing community. |

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Recharts, Monaco Editor.
- **Backend:** FastAPI (Strict MVC Architecture), SQLAlchemy, Pydantic.
- **Database:** PostgreSQL 15, Alembic Migrations.
- **Cache:** Redis 7 (Caching AI responses & Rate limiting).
- **AI Engine:** Anthropic Claude 3.5 Sonnet.
- **Deployment:** Render (Backend), Vercel (Frontend), Docker Desktop (Local).

## 🚀 Quick Start (Local Docker)

The entire platform is containerized for a single-command setup on Windows.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Leelasankar-09/interviewace.git
   cd interviewace
   ```

2. **Configure Environment:**
   ```bash
   copy .env.example .env
   # Open .env and add your ANTHROPIC_API_KEY
   ```

3. **Launch with Docker:**
   ```bash
   docker-compose up --build
   ```

- **App:** [http://localhost:5173](http://localhost:5173)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health:** [http://localhost:8000/health](http://localhost:8000/health)

## 🏛️ Architecture (Strict MVC)

The project follows a rigorous separation of concerns:
- **Routes:** `app/routes/` - API Endpoints.
- **Controllers:** `app/controllers/` - Business logic and orchestration.
- **Repositories:** `app/repositories/` - Direct DB interactions (DRY).
- **Services:** `app/services/` - AI calls, file parsing, and caching.
- **Models/Schemas:** `app/models/` & `app/schemas/` - Data integrity.

## 🚢 Deployment

- **Backend:** Hosted on **Render** (pip install + gunicorn).
- **Frontend:** Hosted on **Vercel** (npm build).
- **CI/CD:** Automated via **GitHub Actions** (`.github/workflows/deploy.yml`).

---
Developed with ❤️ by **Leelasankar** for 2025 Interview Readiness.
