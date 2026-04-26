# AuraStyle

AuraStyle is an AI fashion assistant built for users who want fast, personalized outfit ideas in Albanian, Gheg, or English. The app helps users sign in, generate style recommendations, save favorite looks, and manage a personal outfit collection.

## Live Project

- GitHub Repository: [https://github.com/Rinesamerovci/AuraStyle](https://github.com/Rinesamerovci/AuraStyle)
- Live URL: [https://aurastyle-rinesa.vercel.app](https://aurastyle-rinesa.vercel.app)
- Live URL status: verified with HTTP `200` on April 26, 2026

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Groq API
- Vercel

## Main Features

- Email/password authentication with Supabase
- Protected routes for dashboard, style generator, profile, and saved outfits
- AI outfit generation based on occasion, free-text details, and preferred language
- Saved outfit history backed by Supabase
- Edit and delete actions for saved outfits
- Personal style profile to improve future recommendations
- Offline/session/error handling for stronger demo reliability

## Main User Flow

1. User signs up or signs in at `/auth`
2. User lands on `/dashboard`
3. User opens `/style` and enters occasion + styling details
4. AuraStyle generates up to 3 outfit ideas
5. User saves a favorite recommendation to Supabase
6. User reviews, edits, or deletes saved outfits at `/outfits`

## Routes

- `/` - landing page
- `/auth` - sign in / sign up
- `/dashboard` - user dashboard
- `/style` - AI outfit generator
- `/outfits` - saved outfits collection
- `/profile` - personal style profile

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification Notes

- `npm run lint` passes
- Production build was verified successfully on April 26, 2026
- Live Vercel URL responds successfully
- Demo plan is included in [docs/demo-plan.md](docs/demo-plan.md)

## Demo Readiness

Before presenting, verify:

- the live URL opens correctly
- authentication works
- AI generation responds
- saving to outfits works
- the saved outfits page loads existing data

If the live demo has network issues, use the plan in [docs/demo-plan.md](docs/demo-plan.md).
