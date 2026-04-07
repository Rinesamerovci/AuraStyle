# AuraStyle

Live URL: [https://aurastyle-rinesa.vercel.app](https://aurastyle-rinesa.vercel.app)

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
