# Zenith AI — Intelligent Customer Support System

A production-grade, AI-powered customer support management system built for high-efficiency triage, automated classification, urgency detection, and AI-assisted response drafting.

Built with **React (Vite)**, **Node.js (Express)**, **Supabase (PostgreSQL)**, and **Google Gemini API**, ready for continuous deployment via **GitHub** and **Vercel**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18 + Vite (Responsive, mobile/tablet/desktop ready, fast HMR)
- **Backend**: Node.js + Express (RESTful API, Vercel Serverless Function compatible)
- **Database**: Supabase (Persistent PostgreSQL with RLS, triggers, indexes)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-2.0-flash` with automatic fallback)
- **Deployment**: GitHub + Vercel (Configured via `vercel.json`)

---

## 📂 Project Structure

```
support exam/
├── api/
│   ├── config/
│   │   ├── gemini.js            # Gemini AI classification, urgency, summary & replies
│   │   └── supabase.js          # Supabase client using Service Role Key
│   ├── middleware/
│   │   └── errorHandler.js      # Centralized JSON error handling
│   ├── routes/
│   │   └── requests.js          # REST routes for tickets, status, AI regeneration
│   └── index.js                 # Express application entry (Vercel Serverless ready)
├── client/
│   ├── src/
│   │   ├── api/client.js        # Frontend API client
│   │   ├── components/          # Badges, MetricsOverview, Navbar
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Ticket list, filters, search, metrics
│   │   │   ├── SubmitRequest.jsx# Customer ticket submission form
│   │   │   └── RequestDetail.jsx# Detailed view, status manager, reply regenerator
│   │   ├── App.jsx              # Main layout & router
│   │   ├── index.css            # Responsive design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js           # Vite configuration with API proxy
├── supabase/
│   └── schema.sql               # Database table, triggers, and RLS policies
├── .env.example                 # Environment template
├── .env                         # Local environment variables
├── package.json                 # Root script runner & backend dependencies
├── vercel.json                  # Vercel serverless routing configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies

In the project root directory, run:
```bash
npm install
npm --prefix client install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Open `supabase/schema.sql` from this project, paste the content into the SQL Editor, and click **Run**.
4. Navigate to **Project Settings -> API** and copy:
   - **Project URL** (`SUPABASE_URL`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`)

> ⚠️ **Security**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code. It is kept securely on the Express server.

### 3. Configure Google Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com/) to get an API key.
2. Copy your key (`GEMINI_API_KEY`).

### 4. Set Environment Variables

Create or edit your `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
PORT=3001
```

### 5. Run Locally

Start both the backend server and frontend Vite app concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/api/health`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/requests` | Submit support request (triggers Gemini AI categorization, urgency, summary, & draft reply) |
| `GET` | `/api/requests` | List tickets with filters (`?status=`, `?urgency=`, `?category=`, `?search=`) |
| `GET` | `/api/requests/:id` | Get details for a single ticket |
| `PATCH` | `/api/requests/:id/status` | Update ticket status (`Pending`, `AI Responded`, `Resolved`) |
| `POST` | `/api/requests/:id/regenerate`| Regenerate an AI customer support reply with Gemini |
| `GET` | `/api/health` | Service health status and environment check |

---

## 🌐 Deploy to GitHub & Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AI-Powered Customer Support System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import the GitHub repository.
3. In **Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
4. Click **Deploy**. Vercel will automatically build the Vite frontend and host the Express API routes as serverless functions via `vercel.json`.
