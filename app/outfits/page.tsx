'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppNav from '@/app/components/AppNav'

interface SavedOutfit {
  id: string; prompt: string; response: string;
  occasion: string[]; language: string; savedAt: string;
}

export default function OutfitsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [outfits, setOutfits] = useState<SavedOutfit[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('Të gjitha')

  useEffect(() => { if (!loading && !user) router.push('/auth') }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`aurastyle_outfits_${user.id}`)
      if (saved) { try { setOutfits(JSON.parse(saved)) } catch {} }
    }
  }, [user])

  const handleDelete = (id: string) => {
    if (!user) return
    setDeleting(id)
    setTimeout(() => {
      const updated = outfits.filter(o => o.id !== id)
      setOutfits(updated)
      localStorage.setItem(`aurastyle_outfits_${user.id}`, JSON.stringify(updated))
      setDeleting(null)
      if (expanded === id) setExpanded(null)
    }, 350)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })

  const langLabel = (l: string) => l === 'english' ? 'EN' : l === 'gheg' ? 'GG' : 'SQ'

  const allOccasions = ['Të gjitha', ...Array.from(new Set(outfits.flatMap(o => o.occasion))).filter(Boolean)]
  const filtered = filter === 'Të gjitha' ? outfits : outfits.filter(o => o.occasion.includes(filter))

  if (loading || !user) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Syne:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:          #07090a;
          --ink-2:        #0c100e;
          --ink-3:        #111a14;
          --cream:        #edf4ee;
          --cream-dim:    rgba(237,244,238,0.6);
          --pista:        #8fbb91;
          --pista-bright: #b5d4b6;
          --pista-deep:   #5a8f5c;
          --pista-dim:    rgba(143,187,145,0.1);
          --pista-glow:   rgba(143,187,145,0.22);
          --muted:        #4a5e4b;
          --muted-2:      #2e3d2f;
          --border:       rgba(143,187,145,0.14);
          --border-bright:rgba(143,187,145,0.35);
        }

        body {
          background: var(--ink);
          color: var(--cream);
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
        }

        body::after {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
        }

        /* ─── PAGE SHELL ─── */
        .page {
          padding-top: 64px;
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* ─── HEADER ─── */
        .page-header {
          padding: 64px 64px 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }

        .page-header::before {
          content: '';
          position: absolute;
          top: -120px; right: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(143,187,145,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .header-left { position: relative; z-index: 1; }

        .header-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--pista);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-eyebrow::before {
          content: '';
          width: 24px; height: 1px;
          background: var(--pista);
        }

        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 5vw, 68px);
          font-weight: 400;
          color: var(--cream);
          line-height: 1;
        }

        .header-title em {
          font-style: italic;
          color: var(--pista);
        }

        .header-right {
          position: relative;
          z-index: 1;
          text-align: right;
        }

        .header-count {
          font-family: 'Playfair Display', serif;
          font-size: 88px;
          font-weight: 400;
          font-style: italic;
          color: rgba(143,187,145,0.08);
          line-height: 1;
          user-select: none;
          display: block;
        }

        /* ─── STATS BAR ─── */
        .stats-bar {
          padding: 20px 64px;
          border-bottom: 1px solid var(--border);
          display: flex;
          gap: 0;
          background: var(--ink-2);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 48px 0 0;
          margin-right: 48px;
          border-right: 1px solid var(--border);
        }

        .stat-item:last-child { border-right: none; }

        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 400;
          color: var(--cream);
          line-height: 1;
        }

        .stat-lbl {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* ─── FILTER BAR ─── */
        .filter-bar {
          padding: 0 64px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-end;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filter-bar::-webkit-scrollbar { display: none; }

        .filter-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 16px 20px 16px 0;
          white-space: nowrap;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          margin-right: 12px;
          align-self: center;
        }

        .filter-chip {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          padding: 14px 18px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .filter-chip:hover { color: var(--cream); }

        .filter-chip.on {
          color: var(--pista);
          border-bottom-color: var(--pista);
        }

        /* ─── MAIN CONTENT ─── */
        .content-area {
          padding: 48px 64px 80px;
        }

        /* ─── GRID ─── */
        .outfits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .outfits-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .outfits-grid { grid-template-columns: 1fr; }
        }

        /* ─── CARD ─── */
        .outfit-card {
          background: var(--ink-2);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: border-color 0.25s ease, opacity 0.3s ease, transform 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .outfit-card:hover {
          border-color: var(--border-bright);
        }

        /* top accent line */
        .outfit-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--pista-deep), var(--pista), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .outfit-card:hover::before { opacity: 1; }
        .outfit-card.is-expanded::before { opacity: 1; }

        .outfit-card.is-deleting {
          opacity: 0;
          transform: scale(0.97);
        }

        /* Card inner padding */
        .card-inner {
          padding: 28px 28px 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Top row: badges + delete */
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 8px;
        }

        .card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          flex: 1;
          min-width: 0;
        }

        .badge {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 9px;
          border: 1px solid var(--border);
          color: var(--muted);
          white-space: nowrap;
        }

        .badge-lang {
          border-color: rgba(143,187,145,0.25);
          color: var(--pista);
        }

        .card-delete {
          background: none;
          border: none;
          color: var(--muted-2);
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0 2px;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .card-delete:hover { color: #a05050; }

        /* Number */
        .card-num {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          font-style: italic;
          color: rgba(143,187,145,0.2);
          margin-bottom: 8px;
          letter-spacing: 0.04em;
        }

        /* Title */
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 400;
          color: var(--cream);
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Date */
        .card-date {
          font-size: 11px;
          color: var(--muted-2);
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }

        /* Separator */
        .card-sep {
          height: 1px;
          background: var(--border);
          margin-bottom: 16px;
        }

        /* Preview text */
        .card-preview-wrap {
          position: relative;
          flex: 1;
          margin-bottom: 0;
        }

        .card-preview {
          font-size: 13px;
          font-weight: 400;
          line-height: 1.8;
          color: var(--muted);
          overflow: hidden;
          max-height: 72px;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-preview.expanded {
          max-height: 1200px;
          color: #a8bfaa;
          white-space: pre-wrap;
        }

        .card-preview-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 40px;
          background: linear-gradient(transparent, var(--ink-2));
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .card-preview.expanded + .card-preview-fade {
          opacity: 0;
        }

        /* Card footer */
        .card-footer {
          padding: 14px 28px 20px;
          border-top: 1px solid var(--border);
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .expand-btn {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pista);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }

        .expand-btn:hover { opacity: 0.7; }

        .expand-arrow {
          font-size: 12px;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .expand-btn.is-open .expand-arrow {
          transform: rotate(180deg);
        }

        .card-occ-count {
          font-size: 10px;
          color: var(--muted-2);
          letter-spacing: 0.06em;
        }

        /* ─── EMPTY STATES ─── */
        .empty-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 100px 32px;
          gap: 20px;
          border: 1px solid var(--border);
        }

        .empty-symbol {
          font-family: 'Playfair Display', serif;
          font-size: 72px;
          font-style: italic;
          color: rgba(143,187,145,0.1);
          line-height: 1;
          user-select: none;
        }

        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-style: italic;
          font-weight: 400;
          color: var(--muted);
        }

        .empty-sub {
          font-size: 13px;
          color: var(--muted-2);
          max-width: 280px;
          line-height: 1.8;
        }

        .empty-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding: 13px 28px;
          background: var(--pista);
          color: var(--ink);
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: background 0.2s;
          position: relative;
          overflow: hidden;
        }

        .empty-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.18);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }

        .empty-cta:hover::before { transform: translateX(0); }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 900px) {
          .page-header { padding: 48px 24px 32px; }
          .header-count { display: none; }
          .stats-bar { padding: 16px 24px; gap: 24px; flex-wrap: wrap; }
          .filter-bar { padding: 0 24px; }
          .content-area { padding: 32px 24px 60px; }
        }
      `}</style>

      <AppNav />

      <div className="page">

        {/* HEADER */}
        <div className="page-header">
          <div className="header-left">
            <div className="header-eyebrow">Ruajtura</div>
            <h1 className="header-title">Koleksioni <em>im</em></h1>
          </div>
          {outfits.length > 0 && (
            <div className="header-right">
              <span className="header-count">{outfits.length}</span>
            </div>
          )}
        </div>

        {/* STATS + FILTERS — only when data exists */}
        {outfits.length > 0 && (
          <>
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-num">{outfits.length}</span>
                <span className="stat-lbl">Outfit total</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{Array.from(new Set(outfits.flatMap(o => o.occasion))).length}</span>
                <span className="stat-lbl">Raste</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{filtered.length}</span>
                <span className="stat-lbl">Të shfaqur</span>
              </div>
            </div>

            <div className="filter-bar">
              <span className="filter-label">Filtro</span>
              {allOccasions.map(occ => (
                <button
                  key={occ}
                  className={`filter-chip ${filter === occ ? 'on' : ''}`}
                  onClick={() => setFilter(occ)}
                >
                  {occ}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="content-area">

          {/* EMPTY — no outfits at all */}
          {outfits.length === 0 && (
            <div className="empty-wrap">
              <div className="empty-symbol">✦</div>
              <h2 className="empty-title">Koleksioni është bosh</h2>
              <p className="empty-sub">
                Gjenero outfit-et e tua me AI dhe ruaji ato këtu për t'i parë dhe krahasuar.
              </p>
              <Link href="/style" className="empty-cta">✦ Gjenero Outfit</Link>
            </div>
          )}

          {/* EMPTY — filter yields nothing */}
          {outfits.length > 0 && filtered.length === 0 && (
            <div className="empty-wrap">
              <div className="empty-symbol">—</div>
              <h2 className="empty-title">Asnjë outfit për "{filter}"</h2>
              <p className="empty-sub">Provo një filtër tjetër ose gjenero outfit të ri.</p>
            </div>
          )}

          {/* GRID */}
          {filtered.length > 0 && (
            <div className="outfits-grid">
              {filtered.map((outfit, idx) => (
                <div
                  key={outfit.id}
                  className={[
                    'outfit-card',
                    deleting === outfit.id ? 'is-deleting' : '',
                    expanded === outfit.id ? 'is-expanded' : '',
                  ].join(' ')}
                >
                  <div className="card-inner">
                    {/* Top row */}
                    <div className="card-top">
                      <div className="card-badges">
                        {outfit.occasion.slice(0, 3).map(o => (
                          <span key={o} className="badge">{o}</span>
                        ))}
                        {outfit.occasion.length > 3 && (
                          <span className="badge">+{outfit.occasion.length - 3}</span>
                        )}
                        <span className="badge badge-lang">{langLabel(outfit.language)}</span>
                      </div>
                      <button
                        className="card-delete"
                        onClick={() => handleDelete(outfit.id)}
                        title="Fshij"
                      >×</button>
                    </div>

                    <div className="card-num">No. {String(idx + 1).padStart(2, '0')}</div>

                    <div className="card-title">
                      {outfit.prompt || outfit.occasion.join(', ') || 'Outfit i ruajtur'}
                    </div>

                    <div className="card-date">{formatDate(outfit.savedAt)}</div>

                    <div className="card-sep" />

                    {/* Preview */}
                    <div className="card-preview-wrap">
                      <div className={`card-preview ${expanded === outfit.id ? 'expanded' : ''}`}>
                        {outfit.response}
                      </div>
                      <div className="card-preview-fade" />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="card-footer">
                    <button
                      className={`expand-btn ${expanded === outfit.id ? 'is-open' : ''}`}
                      onClick={() => setExpanded(expanded === outfit.id ? null : outfit.id)}
                    >
                      {expanded === outfit.id ? 'Mbyll' : 'Shiko të gjithë'}
                      <span className="expand-arrow">↓</span>
                    </button>
                    <span className="card-occ-count">
                      {outfit.occasion.length > 0 ? `${outfit.occasion.length} raste` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
