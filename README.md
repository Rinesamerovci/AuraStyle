# AuraStyle

AuraStyle is an AI fashion assistant that helps users generate outfit ideas, compare looks, and save favorite recommendations to a personal collection.

## Quick Start

- GitHub Repository: [https://github.com/Rinesamerovci/AuraStyle](https://github.com/Rinesamerovci/AuraStyle)
- Live URL: [https://aurastyle-rinesa.vercel.app](https://aurastyle-rinesa.vercel.app)
- Stack: Next.js, React, TypeScript, Supabase, Groq

### Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Required `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
```

### Main Features

- AI outfit generation in Albanian, Gheg, and English
- Login and signup with Supabase Auth
- Protected dashboard, style generator, and saved outfits pages
- Save, review, edit, and delete outfit recommendations
- Database-backed user-specific outfit history

### Main Routes

- `/` - landing page
- `/auth` - authentication
- `/dashboard` - user dashboard
- `/style` - AI outfit generator
- `/outfits` - saved outfits collection

## Repository

**GitHub Repository:** [https://github.com/Rinesamerovci/AuraStyle](https://github.com/Rinesamerovci/AuraStyle)

---

## Vercel Deployment Status - April 7, 2026

**Live URL:** [https://aurastyle-rinesa.vercel.app](https://aurastyle-rinesa.vercel.app)

### Checkpoint 1: Application Deployed ✅ (30 points)
- Application deployed and accessible on Vercel without errors
- Live production URL: `https://aurastyle-rinesa.vercel.app`

### Checkpoint 2: Core Features Live ✅ (70 points)

#### AI Chat / Core Functionality ✅ (25 points)
- Groq API integration for outfit recommendations in English, Albanian, and Gheg
- Live feature: Generate custom outfits with AI at `/style` page
- Multi-language support with language selection

#### Authentication Working Live ✅ (15 points)
- Supabase email/password authentication
- Email confirmation requirement for account verification
- Session persistence across page refreshes
- Protected routes: `/dashboard`, `/style`, `/outfits`
- Logout functionality with session management

#### Database Working Live ✅ (15 points)
- Supabase PostgreSQL database integration
- Outfits table with Row Level Security (RLS) policies
- CRUD operations fully implemented:
  - **Create:** Save new outfit recommendations
  - **Read:** Fetch user's saved outfits
  - **Update:** Edit existing outfit entries
  - **Delete:** Remove saved outfits
- User data isolation: Each user sees only their own outfits
- Multi-user tested and verified with RLS enforcement

#### Documentation Complete ✅ (15 points)
- Contains live URL and GitHub repository link
- Project description, features, and tech stack
- Environment variables documentation
- Deployment and setup instructions included

---

## Project Overview

AuraStyle is an AI fashion assistant built with Next.js, Supabase, and Groq. Users can register, confirm their email, sign in, generate outfit ideas, and save their favorite looks to a personal collection backed by the database.

## Features

- AI outfit generation in Albanian, Gheg, and English
- Supabase email/password authentication
- Protected dashboard, style generator, and outfits collection pages
- Database-backed saved outfits with create, read, update, and delete support
- Responsive fashion-focused UI deployed on Vercel

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth + Database
- Groq API
- Vercel

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment Notes

- Production deployment is live on Vercel: `https://aurastyle-rinesa.vercel.app`
- Signup requires email confirmation before first login
- Auth, AI chat, and database persistence were verified against the live deployment
