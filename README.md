# AI Instagram Auto Publisher

Production-ready full-stack starter for generating, scheduling, and publishing Instagram Business content with AI.

## Stack

- React 19, Vite, TypeScript, Material UI, React Query, React Router, Axios, Zustand, React Hook Form, Zod, Recharts
- Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Redis, BullMQ, Node Cron, Winston, Helmet, rate limiting, CORS, compression
- Meta Instagram Graph API, Gemini, Stable Diffusion compatible API, Cloudinary
- Docker and Docker Compose

## Local Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:5000`.

MongoDB and Redis must be running locally, or you can use Docker:

```bash
docker compose up --build
```

## Environment

Configure these files:

- `backend/.env` for API, MongoDB, Redis, JWT, Meta, Gemini, Stable Diffusion, Cloudinary, and email settings
- `client/.env` for `VITE_API_URL`

The app includes safe local fallbacks for AI text/image generation when provider keys are missing, so the interface can be tested before credentials are added.

## Features

- Register, login, forgot/reset password, email verification, JWT access and refresh tokens
- Role-based access for admin-only trend refresh
- Instagram OAuth connection, multiple account storage, disconnect support
- Trend discovery from Google Trends RSS, Reddit, news, and technology RSS feeds
- Gemini-powered content generation for title, caption, hashtags, hooks, CTA, carousel content, and SEO keywords
- Gemini Image and Stable Diffusion image provider abstraction with Cloudinary upload support
- BullMQ + Redis scheduling for one-time, daily, weekly, and monthly posts
- Auto publishing worker using Meta Instagram media container and publish endpoints
- Dashboard, AI studio, content calendar, analytics, and account settings
- Helmet, rate limiting, XSS protection, Mongo sanitization, bcrypt password hashing, Zod validation, audit logs

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/verify-email`
- `GET /api/instagram/oauth/start`
- `GET /api/instagram/oauth/callback`
- `GET /api/instagram`
- `POST /api/posts/generate-content`
- `POST /api/posts/generate-images`
- `POST /api/posts`
- `POST /api/schedules`
- `GET /api/trends`
- `POST /api/trends/refresh`
- `GET /api/analytics/dashboard`

## Production Notes

- Replace local JWT secrets before deploying.
- Add a real email provider inside `EmailService`.
- Configure Meta OAuth redirect URL in the Meta developer console.
- Use HTTPS for all production callbacks and Cloudinary-hosted image URLs.
- Run API and worker processes separately at scale if publishing volume grows.
