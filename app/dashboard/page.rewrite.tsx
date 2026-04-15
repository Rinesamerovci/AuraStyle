'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { getOutfits } from '@/app/lib/outfits-db'
import { useRouter } from 'next/navigation'
import { useOffline } from '@/app/lib/use-offline'
import Link from 'next/link'
import AppNav from '@/app/components/AppNav'

export const dynamic = 'force-dynamic'

const STYLE_TIPS = [
  'Kombino ngjyra neutrale me nje akcent te forte.',
  'Textura e ndryshme e veshjeve krijon thellesi vizuale.',
  'Aksesori i duhur transformon cdo outfit.',
  'Fit-i eshte gjithcka - madhesia e sakte ndikon shume.',
  'Ngjyrat e tokes i shkojne shumices se tipologjive.',
]

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Miremengjes'
  if (hour < 18) return 'Miredita'
  return 'Mirembrema'
}

function getTipForUser(seed: string) {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return STYLE_TIPS[total % STYLE_TIPS.length]
}

export default function DashboardPage() {
  const { user, loading, userProfile } = useAuth()
  const router = useRouter()
  const isOffline = useOffline()
  const [outfitCount, setOutfitCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const loadOutfitCount = async () => {
      try {
        const outfits = await getOutfits()
        if (isMounted) setOutfitCount(outfits.length)
      } catch (error) {
        console.error('Failed to load outfit count:', error)
        if (isMounted) setOutfitCount(0)
      }
    }

    void loadOutfitCount()

    return () => {
      isMounted = false
    }
  }, [user])

  if (loading || !user) return null

  const firstName = userProfile?.name || user.email?.split('@')[0] || 'Stilist'
  const greeting = getGreeting()
  const tip = getTipForUser(user.id || user.email || firstName)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --ink: #0d0d0d; --ink-2: #111009; --cream: #f5f0e8; --pistachio: #9DC183; --muted: #6b6560; --border: rgba(157,193,131,0.12); }
        body { background: var(--ink); color: var(--cream); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        .offline-banner { position: fixed; top: 64px; left: 0; right: 0; background: rgba(192, 57, 43, 0.15); border-bottom: 1px solid rgba(192, 57, 43, 0.4); padding: 10px 20px; text-align: center; font-size: 12px; color: #e07060; font-weight: 500; letter-spacing: 0.08em; z-index: 100; animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }

        .dash-page { padding-top: 64px; min-height: 100vh; }

        .dash-hero { border-bottom: 1px solid var(--border); padding: 72px 64px 64px; position: relative; overflow: hidden; }
        .dash-hero::before { content: ''; position: absolute; top: -200px; right: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(157,193,131,0.06) 0%, transparent 65%); pointer-events: none; }
        .dash-greeting { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pistachio); margin-bottom: 12px; }
        .dash-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 4vw, 56px); font-weight: 300; color: var(--cream); line-height: 1.1; margin-bottom: 8px; }
        .dash-title em { font-style: italic; color: var(--pistachio); }
        .dash-sub { font-size: 14px; color: var(--muted); font-weight: 300; margin-top: 16px; }

        .dash-body { padding: 56px 64px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; max-width: 1200px; }

        .dash-cta-card { grid-column: span 2; background: var(--pistachio); padding: 48px; position: relative; overflow: hidden; text-decoration: none; display: block; transition: filter 0.2s; }
        .dash-cta-card:hover { filter: brightness(1.05); }
        .dash-cta-card::after { content: '->'; position: absolute; bottom: 40px; right: 48px; font-size: 32px; color: rgba(0,0,0,0.15); font-family: 'Cormorant Garamond', serif; transition: transform 0.2s; }
        .dash-cta-card:hover::after { transform: translateX(4px); }
        .cta-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(0,0,0,0.5); margin-bottom: 16px; }
        .cta-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; color: var(--ink); line-height: 1.2; margin-bottom: 12px; }
        .cta-desc { font-size: 14px; color: rgba(0,0,0,0.5); font-weight: 300; }

        .dash-stat-card { background: var(--ink-2); border: 1px solid var(--border); padding: 40px; display: flex; flex-direction: column; justify-content: space-between; min-height: 200px; }
        .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 300; color: var(--cream); line-height: 1; }
        .stat-label { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }

        .dash-tip-card { grid-column: span 3; background: var(--ink-2); border: 1px solid var(--border); padding: 32px 40px; display: flex; align-items: center; gap: 32px; }
        .tip-icon { font-family: 'Cormorant Garamond', serif; font-size: 40px; color: var(--pistachio); opacity: 0.4; flex-shrink: 0; }
        .tip-label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pistachio); margin-bottom: 8px; }
        .tip-text { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; font-style: italic; color: var(--cream); line-height: 1.4; }

        .dash-nav-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; grid-column: span 3; }
        .dash-nav-card { background: var(--ink-2); border: 1px solid var(--border); padding: 32px 40px; text-decoration: none; display: flex; justify-content: space-between; align-items: center; transition: border-color 0.2s, background 0.2s; }
        .dash-nav-card:hover { border-color: rgba(157,193,131,0.35); background: rgba(157,193,131,0.02); }
        .dnc-label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .dnc-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 500; color: var(--cream); }
        .dnc-arrow { font-size: 24px; color: var(--pistachio); opacity: 0.5; transition: opacity 0.2s, transform 0.2s; }
        .dash-nav-card:hover .dnc-arrow { opacity: 1; transform: translateX(4px); }

        @media (max-width: 900px) {
          .dash-hero { padding: 56px 24px 48px; }
          .dash-body { padding: 40px 24px; grid-template-columns: 1fr 1fr; }
          .dash-cta-card { grid-column: span 2; }
          .dash-tip-card { grid-column: span 2; }
          .dash-nav-row { grid-column: span 2; }
        }
        @media (max-width: 600px) {
          .dash-body { grid-template-columns: 1fr; }
          .dash-cta-card, .dash-tip-card { grid-column: 1; }
          .dash-tip-card { flex-direction: column; gap: 16px; }
          .dash-nav-row { grid-column: 1; grid-template-columns: 1fr; }
        }
      `}</style>

      <AppNav />
      {isOffline && (
        <div className="offline-banner">
          Lidhja juaj me internetin u nderpre. Disa funksionalitete mund te mos punojne.
        </div>
      )}
      <div className="dash-page">
        <div className="dash-hero">
          <div className="dash-greeting">{greeting}</div>
          <h1 className="dash-title">Mire se erdhe,<br /><em>{firstName}</em></h1>
          <p className="dash-sub">Cfare do te veshesh sot?</p>
        </div>
        <div className="dash-body">
          <Link href="/style" className="dash-cta-card">
            <div className="cta-label">Veprim kryesor</div>
            <div className="cta-title">Gjenero Outfit te Ri</div>
            <div className="cta-desc">Trego rastin dhe preferencat - AI kujdeset per pjesen tjeter.</div>
          </Link>
          <div className="dash-stat-card">
            <div className="stat-num">{outfitCount}</div>
            <div className="stat-label">Outfit te ruajtura</div>
          </div>
          <div className="dash-tip-card">
            <div className="tip-icon">*</div>
            <div>
              <div className="tip-label">Keshilla e dites</div>
              <div className="tip-text">&quot;{tip}&quot;</div>
            </div>
          </div>
          <div className="dash-nav-row">
            <Link href="/style" className="dash-nav-card">
              <div><div className="dnc-label">AI Shopper</div><div className="dnc-title">Gjenero Outfit</div></div>
              <div className="dnc-arrow">-&gt;</div>
            </Link>
            <Link href="/outfits" className="dash-nav-card">
              <div><div className="dnc-label">Ruajtura</div><div className="dnc-title">Koleksioni im</div></div>
              <div className="dnc-arrow">-&gt;</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
