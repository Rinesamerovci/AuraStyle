'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import { sendChatMessage } from '@/app/lib/chat-client'
import AppNav from '@/app/components/AppNav'

const OCCASIONS = ['Casual', 'Formal', 'Natë', 'Dasëm', 'Verore', 'Minimale', 'Punë', 'Sportive', 'Romantike', 'Udhëtim']
const LANGUAGES = [{ key: 'shqip', label: 'Shqip' }, { key: 'gheg', label: 'Gegë' }, { key: 'english', label: 'EN' }]

interface Idea {
  id: number
  text: string
  loading: boolean
}

interface SavedOutfit {
  id: string; prompt: string; response: string;
  occasion: string[]; language: string; savedAt: string;
}

export default function StylePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [language, setLanguage] = useState('shqip')
  const [details, setDetails] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [activeIdea, setActiveIdea] = useState(0)
  const [comparing, setComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!loading && !user) router.push('/auth') }, [user, loading, router])

  const toggleOccasion = (o: string) => {
    setSelectedOccasions(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
  }

  const buildPrompt = (ideaNum: number) => {
    const occ = selectedOccasions.length ? `Rasti: ${selectedOccasions.join(', ')}. ` : ''
    const variation = ideaNum > 1
      ? `RËNDËSISHME: Ky është sugjerimi #${ideaNum}. Duhet të jetë KREJTËSISHT I NDRYSHËM nga sugjerimet e mëparshme — stil tjetër, ngjyra të tjera, qasje tjetër. `
      : ''
    const lang = language === 'english' ? 'Respond in English.' : language === 'gheg' ? 'Përgjigju në dialektin Gegë.' : 'Përgjigju në shqip standard.'
    return `${occ}${variation}${details}. ${lang}

Si AuraStyle stilist i luksit, gjenero një sugjerim outfit KOMPLET dhe DETAJUAR:

**OUTFIT KRYESOR** — Përshkruaj çdo pjesë veshjeje (sipër, poshtë, këpucë, aksesorë)
**PALETA NGJYRASH** — 5 ngjyra specifike me emra (p.sh. "Krem Ivory, Kafe Karamel...")
**KOMBINIMI PERFEKT** — Pse këto copa funksionojnë bashkë
**KËSHILLA STILI** — 2 këshilla specifike për këtë look
**VLERËSIMI** — Nivel elegance 1-10 dhe për cilin tip personi i përshtatet

Shkruaj me stil, si një stilist i njohur mode.`
  }

  const buildComparePrompt = (idea1: string, idea2: string, idea3?: string) => {
    const lang = language === 'english' ? 'Respond in English.' : language === 'gheg' ? 'Përgjigju në dialektin Gegë.' : 'Përgjigju në shqip standard.'
    const ideas3 = idea3 ? `\n\n**SUGJERIMI 3:**\n${idea3}` : ''
    return `${lang}

Ti je stilist ekspert i modës. Krahaso këto sugjerime outfit-esh dhe vendos cilin është më i mirë:

**SUGJERIMI 1:**
${idea1}

**SUGJERIMI 2:**
${idea2}${ideas3}

Bëj një analizë të thellë:

**🏆 FITUESI** — Cilin zgjedh dhe pse (1-2 fjali të forta)
**SUGJERIMI 1** — Pikat e forta ✓ dhe dobësitë ✗ (3 pika secila)
**SUGJERIMI 2** — Pikat e forta ✓ dhe dobësitë ✗ (3 pika secila)
${idea3 ? '**SUGJERIMI 3** — Pikat e forta ✓ dhe dobësitë ✗ (3 pika secila)\n' : ''}**VERDICT FINAL** — Rekomandimi yt si stilist profesionist në 2-3 fjali

Bëj analizën direkte, specifike dhe me autoritet.`
  }

  const generateIdea = async (isNew = false) => {
    if (!details.trim() && selectedOccasions.length === 0) return
    setError('')
    setShowComparison(false)

    const newId = isNew ? ideas.length + 1 : 1
    const newIdea: Idea = { id: newId, text: '', loading: true }

    if (isNew) {
      setIdeas(prev => [...prev, newIdea])
      setActiveIdea(ideas.length)
    } else {
      setIdeas([newIdea])
      setActiveIdea(0)
      setSavedIds(new Set())
      setComparisonResult('')
    }

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      const reply = await sendChatMessage(buildPrompt(newId))
      if (isNew) {
        setIdeas(prev => prev.map(i => i.id === newId ? { ...i, text: reply, loading: false } : i))
      } else {
        setIdeas([{ id: 1, text: reply, loading: false }])
      }
    } catch (err: any) {
      setError(err.message || 'Gabim gjatë komunikimit me AI.')
      if (isNew) {
        setIdeas(prev => prev.filter(i => i.id !== newId))
        setActiveIdea(Math.max(0, ideas.length - 1))
      } else {
        setIdeas([])
      }
    }
  }

  const compareIdeas = async () => {
    if (ideas.length < 2 || ideas.some(i => i.loading)) return
    setComparing(true)
    setShowComparison(false)
    setError('')
    try {
      const prompt = buildComparePrompt(ideas[0].text, ideas[1].text, ideas[2]?.text)
      const result = await sendChatMessage(prompt)
      setComparisonResult(result)
      setShowComparison(true)
    } catch (err: any) {
      setError('Gabim gjatë krahasimit.')
    } finally {
      setComparing(false)
    }
  }

  const regenSingle = async (ideaId: number, idx: number) => {
    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, loading: true, text: '' } : i))
    setShowComparison(false)
    try {
      const reply = await sendChatMessage(buildPrompt(ideaId))
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, text: reply, loading: false } : i))
    } catch {
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, loading: false } : i))
    }
  }

  const handleSave = (idea: Idea) => {
    if (!user) return
    const key = `aurastyle_outfits_${user.id}`
    const existing: SavedOutfit[] = JSON.parse(localStorage.getItem(key) || '[]')
    const newOutfit: SavedOutfit = {
      id: Date.now().toString(), prompt: details, response: idea.text,
      occasion: selectedOccasions, language, savedAt: new Date().toISOString(),
    }
    localStorage.setItem(key, JSON.stringify([newOutfit, ...existing]))
    setSavedIds(prev => new Set([...prev, idea.id]))
  }

  const handleReset = () => {
    setIdeas([]); setDetails(''); setSelectedOccasions([])
    setError(''); setShowComparison(false); setComparisonResult('')
    setSavedIds(new Set()); setActiveIdea(0)
  }

  const anyLoading = ideas.some(i => i.loading)
  const canCompare = ideas.filter(i => !i.loading && i.text).length >= 2
  const hasIdeas = ideas.length > 0

  if (loading || !user) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Syne:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #080808; --ink-2: #0f0e0c; --ink-3: #161411;
          --cream: #f2ede4; --gold: #c8a96b; --gold-bright: #e2c48a;
          --gold-dim: rgba(200,169,107,0.12); --muted: #5c5650; --muted-2: #3a3530;
          --border: rgba(200,169,107,0.14); --border-bright: rgba(200,169,107,0.35);
        }

        body { background: var(--ink); color: var(--cream); font-family: 'Syne', sans-serif; min-height: 100vh; }

        body::after {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        }

        .page-wrap {
          padding-top: 64px;
          display: grid;
          grid-template-columns: 380px 1fr;
          min-height: calc(100vh - 64px);
        }

        /* ─── LEFT PANEL ─── */
        .input-panel {
          background: var(--ink-2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px);
          position: sticky;
          top: 64px;
          overflow-y: auto;
        }

        .panel-header {
          padding: 40px 36px 32px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .panel-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 10px;
        }

        .panel-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 400;
          color: var(--cream);
          line-height: 1.2;
        }

        .panel-title em { font-style: italic; color: var(--gold); }

        .panel-body { padding: 32px 36px; flex: 1; overflow-y: auto; }

        .inp-section { margin-bottom: 32px; }

        .inp-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .inp-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        .occasions-wrap { display: flex; flex-wrap: wrap; gap: 6px; }

        .occ-chip {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 500;
          padding: 7px 14px;
          border: 1px solid var(--border);
          background: transparent; color: var(--muted);
          cursor: pointer; transition: all 0.18s; letter-spacing: 0.03em;
        }
        .occ-chip:hover { border-color: var(--border-bright); color: var(--cream); }
        .occ-chip.on { background: var(--gold); border-color: var(--gold); color: var(--ink); font-weight: 600; }

        .lang-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }

        .lang-btn {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 10px 8px;
          background: transparent; border: 1px solid var(--border); color: var(--muted);
          cursor: pointer; transition: all 0.18s; text-align: center;
        }
        .lang-btn:hover { border-color: var(--border-bright); color: var(--cream); }
        .lang-btn.on { background: var(--ink-3); border-color: var(--gold); color: var(--gold); }

        .detail-input {
          width: 100%;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          padding: 16px 18px;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 400;
          color: var(--cream); resize: none; height: 120px;
          outline: none; transition: border-color 0.2s; line-height: 1.7; border-radius: 0;
        }
        .detail-input::placeholder { color: var(--muted-2); }
        .detail-input:focus { border-color: var(--gold); }
        .detail-input:disabled { opacity: 0.5; }

        .char-row { display: flex; justify-content: flex-end; margin-top: 6px; }
        .char-count { font-size: 11px; color: var(--muted); }

        .panel-footer {
          padding: 24px 36px 32px;
          border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 10px;
          flex-shrink: 0;
        }

        .btn-generate {
          width: 100%; padding: 16px; background: var(--gold); border: none;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink);
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          position: relative; overflow: hidden;
        }
        .btn-generate::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0.15);
          transform: translateX(-100%); transition: transform 0.4s ease;
        }
        .btn-generate:hover:not(:disabled)::before { transform: translateX(0); }
        .btn-generate:disabled { opacity: 0.35; cursor: not-allowed; }

        .btn-new-idea {
          width: 100%; padding: 13px; background: transparent;
          border: 1px solid var(--border-bright);
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold);
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-new-idea:hover:not(:disabled) { background: var(--gold-dim); }
        .btn-new-idea:disabled { opacity: 0.35; cursor: not-allowed; }

        .btn-reset {
          width: 100%; padding: 10px; background: transparent; border: none;
          font-family: 'Syne', sans-serif; font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted); cursor: pointer; transition: color 0.2s;
        }
        .btn-reset:hover { color: var(--cream); }

        /* ─── RIGHT PANEL ─── */
        .output-panel { display: flex; flex-direction: column; min-height: calc(100vh - 64px); }

        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 24px; padding: 80px 48px; text-align: center;
        }

        .empty-glyph {
          font-family: 'Playfair Display', serif;
          font-size: 80px; font-style: italic;
          color: rgba(200,169,107,0.1); line-height: 1; user-select: none;
        }

        .empty-title { font-family: 'Playfair Display', serif; font-size: 22px; font-style: italic; color: var(--muted); }
        .empty-hint { font-size: 13px; color: var(--muted-2); max-width: 300px; line-height: 1.7; }

        /* TABS HEADER */
        .ideas-header {
          padding: 28px 48px 0;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
        }

        .idea-tabs { display: flex; gap: 0; }

        .idea-tab {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 12px 24px; background: transparent;
          border: 1px solid transparent; border-bottom: none;
          color: var(--muted); cursor: pointer; transition: all 0.2s;
          position: relative; display: flex; align-items: center; gap: 8px;
        }
        .idea-tab:hover { color: var(--cream); }
        .idea-tab.active { background: var(--ink); border-color: var(--border); color: var(--gold); border-bottom-color: var(--ink); margin-bottom: -1px; }

        .tab-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); flex-shrink: 0; }
        .idea-tab.active .tab-dot { background: var(--gold); box-shadow: 0 0 8px var(--gold); }

        .tab-spinner { width: 10px; height: 10px; border: 1.5px solid rgba(200,169,107,0.3); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .compare-btn {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 10px 20px; background: transparent; border: 1px solid var(--border-bright);
          color: var(--gold); cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px; white-space: nowrap; margin-bottom: 1px;
        }
        .compare-btn:hover:not(:disabled) { background: var(--gold-dim); }
        .compare-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* IDEA CONTENT */
        .idea-content {
          padding: 48px; animation: fadeSlide 0.4s ease forwards; flex: 1;
        }

        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .idea-loading-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 80px 48px; gap: 24px; flex: 1;
        }

        .loading-orbs { position: relative; width: 64px; height: 64px; }
        .orb { position: absolute; border: 1px solid; border-radius: 50%; }
        .orb-1 { inset: 0; border-color: rgba(200,169,107,0.1); }
        .orb-2 { inset: 10px; border-color: rgba(200,169,107,0.2); animation: spin 3s linear infinite; }
        .orb-3 { inset: 20px; border-color: rgba(200,169,107,0.4); animation: spin 2s linear infinite reverse; }
        .orb-dot { position: absolute; width: 8px; height: 8px; background: var(--gold); border-radius: 50%; top: 28px; left: 28px; box-shadow: 0 0 16px var(--gold); }

        .loading-text { font-family: 'Playfair Display', serif; font-size: 18px; font-style: italic; color: var(--muted); }

        .idea-num-badge { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 32px; }
        .badge-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 400; font-style: italic; color: rgba(200,169,107,0.2); line-height: 1; }
        .badge-line { width: 1px; height: 40px; background: var(--border); }
        .badge-label { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); }

        .idea-text { font-size: 15px; font-weight: 400; line-height: 2; color: #ccc8be; white-space: pre-wrap; max-width: 720px; }
        .idea-text strong { color: var(--cream); font-weight: 600; }

        .idea-actions { display: flex; gap: 10px; margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border); flex-wrap: wrap; }

        .act-btn { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; padding: 11px 22px; cursor: pointer; transition: all 0.18s; border: 1px solid; display: flex; align-items: center; gap: 8px; }
        .act-save { background: var(--gold); border-color: var(--gold); color: var(--ink); }
        .act-save:hover:not(:disabled) { background: var(--gold-bright); }
        .act-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .act-saved { background: transparent; border-color: rgba(200,169,107,0.2); color: var(--gold); cursor: default; }
        .act-ghost { background: transparent; border-color: var(--border); color: var(--muted); }
        .act-ghost:hover { border-color: var(--border-bright); color: var(--cream); }

        /* COMPARISON */
        .comparison-wrap { border-top: 2px solid var(--gold); background: var(--ink-2); padding: 48px; animation: fadeSlide 0.5s ease forwards; }

        .comp-header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
        .comp-crown { font-size: 28px; }
        .comp-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 400; font-style: italic; color: var(--cream); }
        .comp-title em { color: var(--gold); }
        .comp-badge { margin-left: auto; font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); border: 1px solid var(--border-bright); padding: 6px 14px; }

        .comp-text { font-size: 15px; font-weight: 400; line-height: 1.95; color: #ccc8be; white-space: pre-wrap; max-width: 720px; }

        .error-bar { margin: 0 48px; background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.25); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .error-msg { font-size: 13px; color: #e07060; }
        .error-x { background: none; border: none; color: #e07060; cursor: pointer; font-size: 16px; }

        .comparing-overlay { padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 20px; border-top: 1px solid var(--border); background: var(--ink-2); }
        .comparing-label { font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; color: var(--muted); }

        .sp { width: 14px; height: 14px; border: 1.5px solid rgba(0,0,0,0.2); border-top-color: var(--ink); border-radius: 50%; animation: spin 0.7s linear infinite; }
        .sp-gold { border: 1.5px solid rgba(200,169,107,0.2); border-top-color: var(--gold); }

        @media (max-width: 960px) {
          .page-wrap { grid-template-columns: 1fr; }
          .input-panel { position: static; height: auto; }
          .idea-content, .comparison-wrap, .error-bar, .comparing-overlay { padding: 32px 24px; }
          .ideas-header { padding: 20px 24px 0; flex-direction: column; align-items: flex-start; }
          .empty-state { padding: 60px 24px; }
        }
      `}</style>

      <AppNav />

      <div className="page-wrap">

        {/* ─── LEFT: INPUT PANEL ─── */}
        <aside className="input-panel">
          <div className="panel-header">
            <div className="panel-eyebrow">AI Personal Shopper</div>
            <h1 className="panel-title">Kuro <em>look-un</em><br />tënd</h1>
          </div>

          <div className="panel-body">
            <div className="inp-section">
              <div className="inp-label">Rasti</div>
              <div className="occasions-wrap">
                {OCCASIONS.map(o => (
                  <button key={o} type="button"
                    className={`occ-chip ${selectedOccasions.includes(o) ? 'on' : ''}`}
                    onClick={() => toggleOccasion(o)} disabled={anyLoading}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="inp-section">
              <div className="inp-label">Gjuha</div>
              <div className="lang-row">
                {LANGUAGES.map(l => (
                  <button key={l.key} type="button"
                    className={`lang-btn ${language === l.key ? 'on' : ''}`}
                    onClick={() => setLanguage(l.key)} disabled={anyLoading}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="inp-section">
              <div className="inp-label">Detaje</div>
              <textarea className="detail-input" value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="p.sh. 24 vjeç, dal darkë, preferoj ngjyra neutrale, stil i rehatshëm por elegant..."
                disabled={anyLoading} maxLength={400}
              />
              <div className="char-row"><span className="char-count">{details.length}/400</span></div>
            </div>
          </div>

          <div className="panel-footer">
            <button className="btn-generate"
              onClick={() => generateIdea(false)}
              disabled={anyLoading || (!details.trim() && selectedOccasions.length === 0)}>
              {anyLoading && ideas.length === 1 ? <><div className="sp" /> Duke gjeneruar...</>
                : ideas.length === 0 ? '✦ Gjenero Outfitin'
                : '↺ Rikërkimi i ri'}
            </button>

            {hasIdeas && (
              <button className="btn-new-idea"
                onClick={() => generateIdea(true)}
                disabled={anyLoading || ideas.length >= 3}
                title={ideas.length >= 3 ? 'Maksimumi 3 ide' : ''}>
                {anyLoading && ideas.length > 1
                  ? <><div className="sp sp-gold" /> Duke gjeneruar...</>
                  : <>+ Ide tjetër {ideas.length >= 3 ? '(max 3)' : `(${ideas.filter(i => !i.loading && i.text).length}/3)`}</>}
              </button>
            )}

            {hasIdeas && (
              <button className="btn-reset" onClick={handleReset} disabled={anyLoading}>
                × Fillo nga e para
              </button>
            )}
          </div>
        </aside>

        {/* ─── RIGHT: OUTPUT PANEL ─── */}
        <main className="output-panel" ref={outputRef}>

          {!hasIdeas && (
            <div className="empty-state">
              <div className="empty-glyph">A</div>
              <p className="empty-title">Stili yt fillon këtu</p>
              <p className="empty-hint">
                Zgjidh rastin, shto detaje dhe le AI të gjenerojë deri në 3 ide të ndryshme për t'i krahasuar.
              </p>
            </div>
          )}

          {hasIdeas && (
            <>
              {/* TABS + COMPARE BTN */}
              <div className="ideas-header">
                <div className="idea-tabs">
                  {ideas.map((idea, idx) => (
                    <button key={idea.id}
                      className={`idea-tab ${activeIdea === idx ? 'active' : ''}`}
                      onClick={() => { setActiveIdea(idx); setShowComparison(false); }}>
                      {idea.loading ? <div className="tab-spinner" /> : <div className="tab-dot" />}
                      Ide {idea.id}
                    </button>
                  ))}
                </div>

                {canCompare && (
                  <button className="compare-btn" onClick={compareIdeas} disabled={comparing || anyLoading}>
                    {comparing ? <><div className="sp sp-gold" /> Duke krahasuar...</> : <>⚖ Krahaso Idetë</>}
                  </button>
                )}
              </div>

              {error && (
                <div className="error-bar">
                  <span className="error-msg">⚠ {error}</span>
                  <button className="error-x" onClick={() => setError('')}>✕</button>
                </div>
              )}

              {/* ACTIVE IDEA */}
              {ideas[activeIdea] && (
                ideas[activeIdea].loading ? (
                  <div className="idea-loading-state">
                    <div className="loading-orbs">
                      <div className="orb orb-1" /><div className="orb orb-2" />
                      <div className="orb orb-3" /><div className="orb-dot" />
                    </div>
                    <p className="loading-text">AI po kuron look-un tënd...</p>
                  </div>
                ) : (
                  <div className="idea-content" key={`idea-${activeIdea}-${ideas[activeIdea].id}`}>
                    <div className="idea-num-badge">
                      <span className="badge-num">{String(ideas[activeIdea].id).padStart(2, '0')}</span>
                      <div className="badge-line" />
                      <span className="badge-label">Sugjerimi</span>
                    </div>
                    <div className="idea-text"
                      dangerouslySetInnerHTML={{
                        __html: ideas[activeIdea].text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }}
                    />
                    <div className="idea-actions">
                      {savedIds.has(ideas[activeIdea].id) ? (
                        <span className="act-btn act-saved">✓ Ruajtur</span>
                      ) : (
                        <button className="act-btn act-save" onClick={() => handleSave(ideas[activeIdea])}>
                          Ruaj këtë Outfit
                        </button>
                      )}
                      <button className="act-btn act-ghost"
                        onClick={() => regenSingle(ideas[activeIdea].id, activeIdea)}
                        disabled={anyLoading}>
                        ↺ Rigjeneroj këtë
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* COMPARING LOADER */}
              {comparing && (
                <div className="comparing-overlay">
                  <div className="loading-orbs">
                    <div className="orb orb-1" /><div className="orb orb-2" />
                    <div className="orb orb-3" /><div className="orb-dot" />
                  </div>
                  <p className="comparing-label">AI po analizon dhe krahason idetë...</p>
                </div>
              )}

              {/* COMPARISON RESULT */}
              {showComparison && comparisonResult && (
                <div className="comparison-wrap">
                  <div className="comp-header">
                    <span className="comp-crown">⚖</span>
                    <h2 className="comp-title">Krahasimi i <em>Ideve</em></h2>
                    <span className="comp-badge">AI Verdict</span>
                  </div>
                  <div className="comp-text"
                    dangerouslySetInnerHTML={{
                      __html: comparisonResult
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/🏆/g, '<span style="font-size:18px">🏆</span>')
                        .replace(/✓/g, '<span style="color:#5aaa7a">✓</span>')
                        .replace(/✗/g, '<span style="color:#c06050">✗</span>')
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}
