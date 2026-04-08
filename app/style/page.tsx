'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import { sendChatMessage, validateMessage, SessionExpiredError, NetworkError } from '@/app/lib/chat-client'
import { createOutfit } from '@/app/lib/outfits-db'
import { useOffline } from '@/app/lib/use-offline'
import AppNav from '@/app/components/AppNav'

export const dynamic = 'force-dynamic'

const OCCASIONS = ['Casual', 'Formal', 'Natë', 'Dasëm', 'Verore', 'Minimale', 'Punë', 'Sportive', 'Romantike', 'Udhëtim']
const LANGUAGES = [{ key: 'shqip', label: 'Shqip' }, { key: 'gheg', label: 'Gegë' }, { key: 'english', label: 'EN' }]
const MAX_DETAILS_LENGTH = 5000

interface Idea {
  id: number
  text: string
  loading: boolean
}

interface ErrorState {
  message: string
  type: 'error' | 'session' | 'network' | 'validation'
  recoverable: boolean
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function parseErrorType(error: unknown): ErrorState {
  if (error instanceof SessionExpiredError) {
    return { message: error.message, type: 'session', recoverable: true }
  }
  if (error instanceof NetworkError) {
    return { message: error.message, type: 'network', recoverable: true }
  }
  if (error instanceof Error && error.message.includes('bosh')) {
    return { message: error.message, type: 'validation', recoverable: true }
  }
  if (error instanceof Error && error.message.includes('shumë i gjatë')) {
    return { message: error.message, type: 'validation', recoverable: true }
  }
  return {
    message: getErrorMessage(error, 'Diçka shkoi gabim. Provo përsëri.'),
    type: 'error',
    recoverable: true
  }
}

export default function StylePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const isOffline = useOffline()

  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [language, setLanguage] = useState('shqip')
  const [details, setDetails] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [activeIdea, setActiveIdea] = useState(0)
  const [comparing, setComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState<ErrorState | null>(null)
  const [lastFailedIdeaId, setLastFailedIdeaId] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!loading && !user) router.push('/auth') }, [user, loading, router])

  const toggleOccasion = (o: string) => {
    setSelectedOccasions(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
  }

  // Edge case: Validate input before submission
  const canGenerate = () => {
    if (isGenerating || isOffline) return false
    if (!user) return false
    if (!details.trim() && selectedOccasions.length === 0) {
      setError({ message: 'Shkruaj të paktën diçka ose zgjidh një rast.', type: 'validation', recoverable: true })
      return false
    }
    return true
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
    // Edge case: Prevent double submit
    if (isGenerating) {
      setError({ message: 'Kërkesa po procesohej. Prisni disa sekonda.', type: 'validation', recoverable: true })
      return
    }

    // Edge case: Input validation
    if (!details.trim() && selectedOccasions.length === 0) {
      setError({ message: 'Shkruaj të paktën diçka ose zgjidh një rast.', type: 'validation', recoverable: true })
      return
    }

    // Edge case: Check for excessively long input
    if (details.length > MAX_DETAILS_LENGTH) {
      setError({ message: `Detalet janë shumë të gjata. Maksimum ${MAX_DETAILS_LENGTH} karaktere.`, type: 'validation', recoverable: true })
      return
    }

    // Edge case: Offline check
    if (isOffline) {
      setError({ message: 'Nuk jeni i lidhur me internetin. Provo përsëri.', type: 'network', recoverable: true })
      return
    }

    setError(null)
    setShowComparison(false)
    setIsGenerating(true)

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
      setLastFailedIdeaId(null)
    } catch (error: unknown) {
      // Edge case: Handle session expiration
      const errorState = parseErrorType(error)
      setError(errorState)
      setLastFailedIdeaId(newId)

      if (errorState.type === 'session') {
        // Redirect to login after a delay
        setTimeout(() => {
          signOut()
          router.push('/auth')
        }, 2000)
      }

      if (isNew) {
        setIdeas(prev => prev.filter(i => i.id !== newId))
        setActiveIdea(Math.max(0, ideas.length - 1))
      } else {
        setIdeas([])
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const compareIdeas = async () => {
    // Edge case: Prevent double submit
    if (comparing || ideas.length < 2 || ideas.some(i => i.loading)) return
    setComparing(true)
    setShowComparison(false)
    setError(null)
    try {
      // Edge case: Validate input
      const maxIdea = ideas.reduce((max, idea) => idea.text.length > max ? idea.text.length : max, 0)
      if (maxIdea > MAX_DETAILS_LENGTH * 2) {
        throw new Error('Përmbajtja është shumë komplekse për krahasim. Provo me sugjerime më të shkurter.')
      }

      const prompt = buildComparePrompt(ideas[0].text, ideas[1].text, ideas[2]?.text)
      const result = await sendChatMessage(prompt)
      setComparisonResult(result)
      setShowComparison(true)
    } catch (error: unknown) {
      const errorState = parseErrorType(error)
      setError(errorState)

      if (errorState.type === 'session') {
        setTimeout(() => {
          signOut()
          router.push('/auth')
        }, 2000)
      }
    } finally {
      setComparing(false)
    }
  }

  const regenSingle = async (ideaId: number) => {
    // Edge case: Prevent multiple regenerations
    if (isGenerating) return
    setIsGenerating(true)
    setError(null)
    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, loading: true, text: '' } : i))
    setShowComparison(false)
    try {
      const reply = await sendChatMessage(buildPrompt(ideaId))
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, text: reply, loading: false } : i))
    } catch (error: unknown) {
      const errorState = parseErrorType(error)
      setError(errorState)
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, loading: false } : i))

      if (errorState.type === 'session') {
        setTimeout(() => {
          signOut()
          router.push('/auth')
        }, 2000)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async (idea: Idea) => {
    // Edge case: Prevent multiple saves
    if (!user || isSaving || savedIds.has(idea.id)) return
    setIsSaving(true)
    setError(null)
    try {
      await createOutfit({
        prompt: details,
        response: idea.text,
        occasion: selectedOccasions,
        language,
      })
      setSavedIds(prev => new Set([...prev, idea.id]))
      setError({ message: '✓ Outfit-i u ruajt me sukses!', type: 'error', recoverable: false })
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      console.error('Failed to save outfit:', err)
      const errorMsg = err instanceof Error ? err.message : 'Diçka shkoi gabim.'
      setError({ message: `Dështoi ruajtje: ${errorMsg}`, type: 'error', recoverable: true })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setIdeas([]); setDetails(''); setSelectedOccasions([])
    setError(null); setShowComparison(false); setComparisonResult('')
    setSavedIds(new Set()); setActiveIdea(0); setIsGenerating(false)
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
          --cream: #f2ede4; --pistachio: #9DC183; --pistachio-bright: #A8D08D;
          --pistachio-dim: rgba(157,193,131,0.12); --muted: #5c5650; --muted-2: #3a3530;
          --border: rgba(157,193,131,0.14); --border-bright: rgba(157,193,131,0.35);
          --error: #dc3545; --error-light: rgba(220, 53, 69, 0.1);
        }

        body { background: var(--ink); color: var(--cream); font-family: 'Syne', sans-serif; min-height: 100vh; }

        body::after {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        }

        .page-wrap {
          padding-top: 64px;
          display: grid;
          grid-template-columns: 400px 1fr;
          min-height: calc(100vh - 64px);
          background: linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%);
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
          box-shadow: 2px 0 20px rgba(0,0,0,0.3);
        }

        .panel-header {
          padding: 48px 40px 40px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--ink-2) 0%, rgba(157,193,131,0.03) 100%);
          position: relative;
        }

        .panel-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at top right, rgba(157,193,131,0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .panel-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--pistachio);
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .panel-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 400;
          color: var(--cream);
          line-height: 1.2;
          position: relative;
          z-index: 1;
        }

        .panel-title em { 
          font-style: italic; 
          color: var(--pistachio);
          font-weight: 500;
        }

        .panel-body { 
          padding: 40px 40px; 
          flex: 1; 
          overflow-y: auto; 
        }

        .inp-section { 
          margin-bottom: 40px; 
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          padding: 24px;
          border: 1px solid var(--border);
        }

        .inp-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--pistachio);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .inp-label::before {
          content: '';
          width: 4px;
          height: 4px;
          background: var(--pistachio);
          border-radius: 50%;
        }

        .occasions-wrap { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px; 
        }

        .occ-chip {
          font-family: 'Syne', sans-serif;
          font-size: 12px; 
          font-weight: 500;
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: transparent; 
          color: var(--muted);
          cursor: pointer; 
          transition: all 0.25s ease;
          letter-spacing: 0.03em;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }

        .occ-chip::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(157,193,131,0.1), transparent);
          transition: left 0.5s;
        }

        .occ-chip:hover::before { left: 100%; }

        .occ-chip:hover { 
          border-color: var(--border-bright); 
          color: var(--cream);
          transform: translateY(-1px);
        }

        .occ-chip.on { 
          background: var(--pistachio); 
          border-color: var(--pistachio); 
          color: var(--ink); 
          font-weight: 600; 
          box-shadow: 0 2px 8px rgba(157,193,131,0.3);
        }

        .lang-row { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 8px; 
        }

        .lang-btn {
          font-family: 'Syne', sans-serif;
          font-size: 12px; 
          font-weight: 600; 
          letter-spacing: 0.1em; 
          text-transform: uppercase;
          padding: 12px 8px;
          background: transparent; 
          border: 1px solid var(--border); 
          color: var(--muted);
          cursor: pointer; 
          transition: all 0.25s ease;
          text-align: center;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .lang-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(157,193,131,0.1), transparent);
          transition: left 0.5s;
        }

        .lang-btn:hover::before { left: 100%; }

        .lang-btn:hover { 
          border-color: var(--border-bright); 
          color: var(--cream);
          transform: translateY(-1px);
        }

        .lang-btn.on { 
          background: var(--ink-3); 
          border-color: var(--pistachio); 
          color: var(--pistachio);
          box-shadow: 0 2px 8px rgba(157,193,131,0.2);
        }

        .detail-input {
          width: 100%;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          padding: 20px 20px;
          font-family: 'Syne', sans-serif;
          font-size: 14px; 
          font-weight: 400;
          color: var(--cream); 
          resize: vertical; 
          height: 140px;
          outline: none; 
          transition: all 0.3s ease;
          line-height: 1.6; 
          border-radius: 8px;
        }

        .detail-input::placeholder { 
          color: var(--muted-2); 
          font-style: italic;
        }

        .detail-input:hover {
          border-color: var(--border-bright);
          background: rgba(255,255,255,0.035);
        }

        .detail-input:focus { 
          border-color: var(--pistachio); 
          background: rgba(157,193,131,0.05);
          box-shadow: 0 0 0 3px rgba(157,193,131,0.1);
        }

        .detail-input:disabled { 
          opacity: 0.5; 
          cursor: not-allowed;
        }

        .char-row { display: flex; justify-content: flex-end; margin-top: 6px; }
        .char-count { font-size: 11px; color: var(--muted); }

        .panel-footer {
          padding: 32px 40px 40px;
          border-top: 1px solid var(--border);
          display: flex; 
          flex-direction: column; 
          gap: 16px;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--ink-2) 0%, rgba(157,193,131,0.02) 100%);
        }

        .btn-generate {
          width: 100%; 
          padding: 18px; 
          background: linear-gradient(135deg, var(--pistachio) 0%, var(--pistachio-bright) 100%);
          border: none;
          font-family: 'Syne', sans-serif; 
          font-size: 13px; 
          font-weight: 700;
          letter-spacing: 0.18em; 
          text-transform: uppercase; 
          color: var(--ink);
          cursor: pointer; 
          transition: all 0.3s ease;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 12px;
          position: relative; 
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(157,193,131,0.3);
        }

        .btn-generate::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .btn-generate:hover:not(:disabled)::before { 
          transform: translateX(100%);
        }

        .btn-generate:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(157,193,131,0.4);
        }

        .btn-generate:disabled { 
          opacity: 0.4; 
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-new-idea {
          width: 100%; 
          padding: 14px; 
          background: transparent;
          border: 1px solid var(--border-bright);
          font-family: 'Syne', sans-serif; 
          font-size: 12px; 
          font-weight: 600;
          letter-spacing: 0.14em; 
          text-transform: uppercase; 
          color: var(--pistachio);
          cursor: pointer; 
          transition: all 0.3s ease;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 8px;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .btn-new-idea::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(157,193,131,0.1) 0%, rgba(157,193,131,0.05) 100%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .btn-new-idea:hover:not(:disabled)::before { 
          transform: translateX(100%);
        }

        .btn-new-idea:hover:not(:disabled) { 
          border-color: var(--pistachio);
          background: rgba(157,193,131,0.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(157,193,131,0.2);
        }

        .btn-new-idea:disabled { 
          opacity: 0.4; 
          cursor: not-allowed;
          transform: none;
        }

        .btn-reset {
          width: 100%; 
          padding: 12px; 
          background: transparent; 
          border: none;
          font-family: 'Syne', sans-serif; 
          font-size: 11px; 
          letter-spacing: 0.12em;
          text-transform: uppercase; 
          color: var(--muted); 
          cursor: pointer; 
          transition: all 0.25s ease;
          border-radius: 4px;
          position: relative;
        }

        .btn-reset:hover { 
          color: var(--cream);
          background: rgba(255,255,255,0.05);
        }

        /* ─── RIGHT PANEL ─── */
        .output-panel { 
          display: flex; 
          flex-direction: column; 
          min-height: calc(100vh - 64px);
          background: linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%);
        }

        .empty-state {
          flex: 1; 
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: center;
          gap: 32px; 
          padding: 80px 48px; 
          text-align: center;
          background: radial-gradient(circle at center, rgba(157,193,131,0.02) 0%, transparent 70%);
        }

        .empty-glyph {
          font-family: 'Playfair Display', serif;
          font-size: 96px; 
          font-style: italic;
          color: rgba(157,193,131,0.15); 
          line-height: 1; 
          user-select: none;
          margin-bottom: 16px;
        }

        .empty-title { 
          font-family: 'Playfair Display', serif; 
          font-size: 28px; 
          font-style: italic; 
          color: var(--muted);
          margin-bottom: 16px;
        }

        .empty-hint { 
          font-size: 15px; 
          color: var(--muted-2); 
          max-width: 400px; 
          line-height: 1.7;
          font-weight: 300;
        }

        /* TABS HEADER */
        .ideas-header {
          padding: 32px 48px 0;
          border-bottom: 1px solid var(--border);
          display: flex; 
          align-items: flex-end; 
          justify-content: space-between; 
          gap: 20px;
          background: linear-gradient(135deg, var(--ink) 0%, rgba(157,193,131,0.01) 100%);
        }

        .idea-tabs { 
          display: flex; 
          gap: 0; 
          background: var(--ink-2);
          border-radius: 8px;
          padding: 4px;
          border: 1px solid var(--border);
        }

        .idea-tab {
          font-family: 'Syne', sans-serif;
          font-size: 12px; 
          font-weight: 600; 
          letter-spacing: 0.1em; 
          text-transform: uppercase;
          padding: 12px 20px; 
          background: transparent;
          border: none;
          color: var(--muted); 
          cursor: pointer; 
          transition: all 0.3s ease;
          position: relative; 
          display: flex; 
          align-items: center; 
          gap: 8px;
          border-radius: 6px;
          min-width: 80px;
          justify-content: center;
        }

        .idea-tab:hover { 
          color: var(--cream);
          background: rgba(255,255,255,0.05);
        }

        .idea-tab.active { 
          background: var(--pistachio); 
          color: var(--ink); 
          box-shadow: 0 2px 8px rgba(157,193,131,0.3);
          font-weight: 700;
        }

        .tab-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); flex-shrink: 0; }
        .idea-tab.active .tab-dot { background: var(--pistachio); box-shadow: 0 0 8px var(--pistachio); }

        .tab-spinner { width: 10px; height: 10px; border: 1.5px solid rgba(157,193,131,0.3); border-top-color: var(--pistachio); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .compare-btn {
          font-family: 'Syne', sans-serif;
          font-size: 12px; 
          font-weight: 700; 
          letter-spacing: 0.14em; 
          text-transform: uppercase;
          padding: 12px 24px; 
          background: linear-gradient(135deg, var(--pistachio) 0%, var(--pistachio-bright) 100%);
          border: none; 
          color: var(--ink); 
          cursor: pointer; 
          transition: all 0.3s ease;
          display: flex; 
          align-items: center; 
          gap: 8px; 
          white-space: nowrap; 
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(157,193,131,0.3);
        }

        .compare-btn:hover:not(:disabled) { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(157,193,131,0.4);
        }

        .compare-btn:disabled { 
          opacity: 0.4; 
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* IDEA CONTENT */
        .idea-content {
          padding: 48px; 
          animation: fadeSlide 0.4s ease forwards; 
          flex: 1;
          background: linear-gradient(135deg, var(--ink) 0%, rgba(157,193,131,0.01) 100%);
        }

        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .idea-loading-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 80px 48px; gap: 24px; flex: 1;
        }

        .loading-orbs { position: relative; width: 64px; height: 64px; }
        .orb { position: absolute; border: 1px solid; border-radius: 50%; }
        .orb-1 { inset: 0; border-color: rgba(157,193,131,0.1); }
        .orb-2 { inset: 10px; border-color: rgba(157,193,131,0.2); animation: spin 3s linear infinite; }
        .orb-3 { inset: 20px; border-color: rgba(157,193,131,0.4); animation: spin 2s linear infinite reverse; }
        .orb-dot { position: absolute; width: 8px; height: 8px; background: var(--pistachio); border-radius: 50%; top: 28px; left: 28px; box-shadow: 0 0 16px var(--pistachio); }

        .loading-text { font-family: 'Playfair Display', serif; font-size: 18px; font-style: italic; color: var(--muted); }

        .idea-num-badge { 
          display: inline-flex; 
          align-items: center; 
          gap: 16px; 
          margin-bottom: 32px; 
          background: var(--ink-2);
          padding: 12px 20px;
          border-radius: 20px;
          border: 1px solid var(--border);
        }

        .badge-num { 
          font-family: 'Playfair Display', serif; 
          font-size: 32px; 
          font-weight: 400; 
          font-style: italic; 
          color: var(--pistachio); 
          line-height: 1; 
        }

        .badge-line { 
          width: 1px; 
          height: 32px; 
          background: var(--border); 
        }

        .badge-label { 
          font-size: 11px; 
          font-weight: 600; 
          letter-spacing: 0.2em; 
          text-transform: uppercase; 
          color: var(--pistachio); 
        }

        .idea-text { 
          font-size: 16px; 
          font-weight: 400; 
          line-height: 1.8; 
          color: #ccc8be; 
          white-space: pre-wrap; 
          max-width: 720px; 
          margin-bottom: 40px;
        }

        .idea-text strong { 
          color: var(--cream); 
          font-weight: 600; 
        }

        .idea-actions { 
          display: flex; 
          gap: 12px; 
          margin-top: 48px; 
          padding-top: 32px; 
          border-top: 1px solid var(--border); 
          flex-wrap: wrap; 
        }

        .act-btn { 
          font-family: 'Syne', sans-serif; 
          font-size: 12px; 
          font-weight: 600; 
          letter-spacing: 0.14em; 
          text-transform: uppercase; 
          padding: 12px 24px; 
          cursor: pointer; 
          transition: all 0.3s ease;
          border: 1px solid; 
          display: flex; 
          align-items: center; 
          gap: 8px;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .act-save { 
          background: var(--pistachio); 
          border-color: var(--pistachio); 
          color: var(--ink);
          box-shadow: 0 2px 8px rgba(157,193,131,0.3);
        }

        .act-save:hover:not(:disabled) { 
          background: var(--pistachio-bright);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(157,193,131,0.4);
        }

        .act-save:disabled { 
          opacity: 0.5; 
          cursor: not-allowed; 
          transform: none;
          box-shadow: none;
        }

        .act-ghost { 
          background: transparent; 
          border-color: var(--border); 
          color: var(--muted); 
        }

        .act-ghost:hover { 
          border-color: var(--border-bright); 
          color: var(--cream);
          background: rgba(255,255,255,0.05);
        }

        /* COMPARISON */
        .comparison-wrap { border-top: 2px solid var(--pistachio); background: var(--ink-2); padding: 48px; animation: fadeSlide 0.5s ease forwards; }

        .comp-header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
        .comp-crown { font-size: 28px; }
        .comp-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 400; font-style: italic; color: var(--cream); }
        .comp-title em { color: var(--pistachio); }
        .comp-badge { margin-left: auto; font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pistachio); border: 1px solid var(--border-bright); padding: 6px 14px; }

        .comp-text { font-size: 15px; font-weight: 400; line-height: 1.95; color: #ccc8be; white-space: pre-wrap; max-width: 720px; }

        .error-bar { 
          margin: 0 48px; 
          padding: 16px 24px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          border-radius: 8px;
          border-left: 4px solid;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          gap: 16px;
          animation: slideInError 0.3s ease;
        }

        @keyframes slideInError { 
          from { transform: translateY(-10px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }

        .error-bar-error {
          background: rgba(220, 53, 69, 0.1);
          border-color: #dc3545;
        }

        .error-bar-session {
          background: rgba(255, 152, 0, 0.1);
          border-color: #ff9800;
        }

        .error-bar-network {
          background: rgba(33, 150, 243, 0.1);
          border-color: #2196f3;
        }

        .error-bar-validation {
          background: rgba(76, 175, 80, 0.1);
          border-color: #4caf50;
        }

        .error-msg { 
          font-size: 14px; 
          font-weight: 500;
          flex: 1;
        }

        .error-bar-error .error-msg { color: #ff6b7a; }
        .error-bar-session .error-msg { color: #ffa500; }
        .error-bar-network .error-msg { color: #42a5f5; }
        .error-bar-validation .error-msg { color: #66bb6a; }

        .error-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .retry-btn, .logout-btn { 
          background: none; 
          border: 1px solid currentColor;
          color: inherit;
          cursor: pointer; 
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 4px;
          transition: all 0.2s ease;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .error-bar-error .retry-btn { color: #ff6b7a; }
        .error-bar-error .retry-btn:hover { background: rgba(255, 107, 122, 0.1); }

        .error-bar-network .retry-btn { color: #42a5f5; }
        .error-bar-network .retry-btn:hover { background: rgba(66, 165, 245, 0.1); }

        .error-bar-session .logout-btn { color: #ffa500; }
        .error-bar-session .logout-btn:hover { background: rgba(255, 165, 0, 0.1); }

        .error-x { 
          background: none; 
          border: none; 
          cursor: pointer; 
          font-size: 16px;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .error-bar-error .error-x { color: #ff6b7a; }
        .error-bar-error .error-x:hover { background: rgba(255, 107, 122, 0.1); }

        .error-bar-session .error-x { color: #ffa500; }
        .error-bar-session .error-x:hover { background: rgba(255, 165, 0, 0.1); }

        .error-bar-network .error-x { color: #42a5f5; }
        .error-bar-network .error-x:hover { background: rgba(66, 165, 245, 0.1); }

        .error-bar-validation .error-x { color: #66bb6a; }
        .error-bar-validation .error-x:hover { background: rgba(102, 187, 106, 0.1); }

        .offline-banner { position: fixed; top: 64px; left: 0; right: 0; background: rgba(192, 57, 43, 0.15); border-bottom: 1px solid rgba(192, 57, 43, 0.4); padding: 10px 20px; text-align: center; font-size: 12px; color: #e07060; font-weight: 500; letter-spacing: 0.08em; z-index: 100; animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }

        .error-actions { display: flex; gap: 8px; }
        .retry-btn { background: #e07060; color: white; border: none; padding: 4px 12px; font-size: 11px; cursor: pointer; transition: background 0.2s; font-weight: 600; }
        .retry-btn:hover { background: #f08070; }
        .error-x { padding: 4px 8px; }

        .comparing-overlay { padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 20px; border-top: 1px solid var(--border); background: var(--ink-2); }
        .comparing-label { font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; color: var(--muted); }

        .sp { width: 14px; height: 14px; border: 1.5px solid rgba(0,0,0,0.2); border-top-color: var(--ink); border-radius: 50%; animation: spin 0.7s linear infinite; }
        .sp-gold { border: 1.5px solid rgba(157,193,131,0.2); border-top-color: var(--pistachio); }

        @media (max-width: 960px) {
          .page-wrap { grid-template-columns: 1fr; }
          .input-panel { position: static; height: auto; }
          .idea-content, .comparison-wrap, .error-bar, .comparing-overlay { padding: 32px 24px; }
          .ideas-header { padding: 20px 24px 0; flex-direction: column; align-items: flex-start; }
          .empty-state { padding: 60px 24px; }
          .panel-header { padding: 32px 24px 24px; }
          .panel-body { padding: 24px; }
          .panel-footer { padding: 24px; }
        }
      `}</style>

      <AppNav />

      {isOffline && (
        <div className="offline-banner">
          📡 Lidhja juaj me internetin u ndërpre. Disa funksionalitete mund të mos punojnë.
        </div>
      )}

      <div className="page-wrap" style={isOffline ? { marginTop: '40px' } : {}}>

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
              disabled={isGenerating || anyLoading || (!details.trim() && selectedOccasions.length === 0)}>
              {isGenerating && ideas.length === 1 ? <><div className="sp" /> Duke gjeneruar...</>
                : ideas.length === 0 ? '✦ Gjenero Outfitin'
                : '↺ Rikërkimi i ri'}
            </button>

            {hasIdeas && (
              <button className="btn-new-idea"
                onClick={() => generateIdea(true)}
                disabled={isGenerating || anyLoading || ideas.length >= 3}
                title={ideas.length >= 3 ? 'Maksimumi 3 ide' : ''}>
                {(isGenerating || anyLoading) && ideas.length > 1
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
                Zgjidh rastin, shto detaje dhe le AI të gjenerojë deri në 3 ide të ndryshme për t&apos;i krahasuar.
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
                  <button className="compare-btn" onClick={compareIdeas} disabled={comparing || anyLoading || isGenerating}>
                    {comparing ? <><div className="sp sp-gold" /> Duke krahasuar...</> : <>⚖ Krahaso Idetë</>}
                  </button>
                )}
              </div>

              {error && (
                <div className={`error-bar error-bar-${error.type}`}>
                  <span className="error-msg">
                    {error.type === 'session' ? '🔒' : error.type === 'network' ? '📶' : error.type === 'validation' ? 'ℹ️' : '⚠'}
                    {' '}{error.message}</span>
                  <div className="error-actions">
                    {error.recoverable && lastFailedIdeaId && error.type !== 'session' && (
                      <button className="retry-btn" onClick={() => generateIdea(ideas.length > 0)}>
                        ↻ Provo Sërish
                      </button>
                    )}
                    {error.type === 'session' && (
                      <button className="logout-btn" onClick={() => { signOut(); router.push('/auth'); }}>
                        Hyr Sërish
                      </button>
                    )}
                    <button className="error-x" onClick={() => setError(null)}>✕</button>
                  </div>
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
                        <button className="act-btn act-save" onClick={() => handleSave(ideas[activeIdea])}
                          disabled={isSaving || isGenerating}>
                          {isSaving ? '⏳ Po ruhet...' : 'Ruaj këtë Outfit'}
                        </button>
                      )}
                      <button className="act-btn act-ghost"
                        onClick={() => regenSingle(ideas[activeIdea].id)}
                        disabled={isGenerating || anyLoading}>
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
