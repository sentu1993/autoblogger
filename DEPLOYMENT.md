# 🚀 Billion-Dollar Deployment Guide

To take the **Autoblogger AI Engine** live, follow this elite deployment strategy.

## 1. Frontend (Vercel)
The dashboard is optimized for Vercel.

1.  **Push to GitHub**: Ensure your project is in a GitHub repository.
2.  **Import to Vercel**: Go to [vercel.com/new](https://vercel.com/new).
3.  **Configure Project**:
    - **Root Directory**: Select `frontend`.
    - **Framework Preset**: Next.js.
4.  **Environment Variables**:
    - Add `NEXT_PUBLIC_API_URL` (Set this to your deployed backend URL).
5.  **Deploy**: Hit the deploy button.

## 2. Backend (Railway or Render)
Since the engine uses FastAPI, Celery, and Redis, I recommend **Railway** for a seamless setup.

1.  **Railway Setup**: Import the repository to Railway.
2.  **Services**: Railway will detect the `backend/Dockerfile` and `docker-compose.yml`.
3.  **Environment Variables**:
    - `DATABASE_URL`: Point to a production PostgreSQL (e.g., Supabase or Railway's DB).
    - `REDIS_URL`: Point to your Redis instance.
    - `OPENAI_API_KEY`: Your production key.
    - `GEMINI_API_KEY`: Your production key.
    - `ENCRYPTION_KEY`: A secure 32-character string.

## 3. Database (PostgreSQL)
For a billion-dollar scale, use a managed provider:
- **Supabase** or **Neon** (Recommended for speed and performance).

---

### Production Check-list
- [ ] Backend CORS origins updated to your Vercel URL.
- [ ] API keys stored in Vercel/Railway secrets (not `.env`).
- [ ] SSL enabled on all endpoints.

Your empire is ready for the global stage. 🌍
