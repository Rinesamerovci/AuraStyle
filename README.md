This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## AuraStyle - Reflection

### Project Overview
AuraStyle is a modern fashion AI assistant application built with Next.js 16, React 19, and TypeScript. It combines personalized outfit generation with user authentication and a curated collection management system.

### Key Features Implemented

#### 1. **Authentication & User Management**
- Supabase email/password authentication
- User profile metadata storage (name, email)
- Session persistence across browser refreshes
- Protected routes with automatic redirects
- Logout functionality with secure session clearing

#### 2. **Unified Form Component**
- Reusable `AuthForm` component for login and signup
- Dynamic form validation (email, password strength, required fields)
- Password visibility toggle
- Comprehensive Albanian error messages
- Loading states with disabled inputs

#### 3. **Design System - Pistachio Theme**
- Primary color: `#9DC183` (pistachio green)
- Elegant typography using Cormorant Garamond and DM Sans
- Consistent spacing and border radius
- Smooth transitions and hover states
- Responsive layout (mobile-first approach)

#### 4. **Application Architecture**
- **Protected Pages**: Dashboard, Style Generator, Outfit Collection
- **Public Pages**: Landing page, Authentication
- **Components**: Navigation bar with logout, authenticated user display
- **API Routes**: Chat endpoint for AI integration
- **Context API**: Centralized auth state management

#### 5. **Setup & Configuration**
- Environment variables stored in `.env.local` (see `.env.example`)
- Required Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Middleware for session management
- Server-side rendering optimization

### Technical Decisions

**Why Supabase?**
- Built-in email authentication
- Secure session management with HTTP-only cookies
- User metadata storage without additional databases
- Real-time capabilities for future features

**Why Context API?**
- Lightweight state management for auth
- Avoids prop drilling
- Sufficient for current feature scope
- Easy to migrate to Redux if needed later

**Why Custom Forms?**
- Full control over UI/UX
- No external form library dependencies
- Optimized performance
- Tailored error messages in Albanian

### Future Enhancements
- OAuth integration (Google, Apple)
- Multi-language support
- User preferences (dark/light theme toggle)
- Outfit sharing and social features
- Advanced filtering in outfit collection
- Payment integration for premium features

### Performance Metrics
- Zero external UI libraries (custom styled components)
- Optimized font loading (Google Fonts with display=swap)
- Fixed navigation for better UX
- Efficient authentication state management
- Minimal bundle size
