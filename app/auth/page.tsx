'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/auth-context'
import Link from 'next/link'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { signUp, signIn, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email || !password) { setError('Plotëso të gjitha fushat.'); return }
    if (password.length < 6) { setError('Fjalëkalimi duhet të ketë të paktën 6 karaktere.'); return }
    if (mode === 'signup' && !name.trim()) { setError('Emri është i detyrueshëm.'); return }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) { setError('Shkruaj një email të vlefshëm.'); return }
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, name)
        setSuccess('Llogara u krijua! Kontrolloni emailin për të konfirmuar. Pastaj mund të hysh.')
        setMode('signin')
        setEmail('')
        setPassword('')
        setName('')
      } else {
        await signIn(email, password)
        router.push('/dashboard')
      }
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.includes('Invalid login')) setError('Email ose fjalëkalim i gabim.')
      else if (msg.includes('already registered')) setError('Ky email është i regjistruar. Hyr.')
      else if (msg.includes('Email not confirmed')) setError('Konfirmo emailin para se të hysh.')
      else if (msg.includes('AuthRetryableError')) setError('Lidhje probleme. Provo sërish.')
      else setError(msg || 'Diçka shkoi gabim.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0d0d0d; --ink-2: #141210; --cream: #f5f0e8;
          --pistachio: #9DC183; --muted: #6b6560;
          --border: rgba(157,193,131,0.15);
        }
        body { background: var(--ink); color: var(--cream); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .auth-layout { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }

        .auth-left {
          position: relative; background: var(--ink-2);
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 48px 56px; overflow: hidden;
        }
        .auth-left::before {
          content: ''; position: absolute; top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(157,193,131,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .al-logo { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--cream); text-decoration: none; position: relative; z-index: 1; }
        .al-center { position: relative; z-index: 1; }
        .al-quote { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 4vw, 52px); font-weight: 300; line-height: 1.15; color: var(--cream); margin-bottom: 24px; }
        .al-quote em { font-style: italic; color: var(--pistachio); }
        .al-desc { font-size: 14px; font-weight: 300; color: var(--muted); line-height: 1.8; max-width: 340px; }
        .al-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 40px; position: relative; z-index: 1; }
        .al-tag { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--border); padding: 6px 14px; }
        .al-bottom { font-size: 12px; color: var(--muted); position: relative; z-index: 1; }

        .geo-wrap { position: absolute; right: 48px; top: 50%; transform: translateY(-50%); z-index: 0; }
        .geo-ring { position: absolute; border: 1px solid; border-radius: 50%; }
        .gr-1 { width: 160px; height: 160px; top: -80px; left: -80px; border-color: rgba(157,193,131,0.08); }
        .gr-2 { width: 100px; height: 100px; top: -50px; left: -50px; border-color: rgba(157,193,131,0.15); }
        .gr-3 { width: 48px; height: 48px; top: -24px; left: -24px; border-color: rgba(157,193,131,0.3); animation: spin 8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-right { display: flex; align-items: center; justify-content: center; padding: 48px; }
        .auth-card { width: 100%; max-width: 420px; }

        .auth-tabs { display: flex; margin-bottom: 48px; border-bottom: 1px solid var(--border); }
        .auth-tab { flex: 1; padding: 0 0 20px; font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 500; color: var(--muted); background: none; border: none; cursor: pointer; text-align: center; position: relative; transition: color 0.25s; }
        .auth-tab.active { color: var(--cream); }
        .auth-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: var(--pistachio); }

        .field-group { margin-bottom: 20px; }
        .field-label { display: block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
        .field-wrap { position: relative; }
        .field-input { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 14px 16px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 300; color: var(--cream); outline: none; transition: all 0.2s; border-radius: 0; }
        .field-input::placeholder { color: #3d3832; }
        .field-input:focus { border-color: var(--pistachio); background: rgba(157,193,131,0.03); }
        .field-input.has-toggle { padding-right: 48px; }
        .toggle-pass { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; font-size: 16px; transition: color 0.2s; }
        .toggle-pass:hover { color: var(--cream); }

        .alert { padding: 12px 16px; font-size: 13px; margin-bottom: 20px; display: flex; gap: 10px; align-items: flex-start; }
        .alert.error { background: rgba(220,60,60,0.08); border: 1px solid rgba(220,60,60,0.3); color: #f07070; }
        .alert.success { background: rgba(80,180,120,0.08); border: 1px solid rgba(80,180,120,0.3); color: #6ec99a; }

        .submit-btn { width: 100%; padding: 16px; margin-top: 8px; background: var(--pistachio); border: none; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .submit-btn:hover:not(:disabled) { background: var(--cream); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner-sm { width: 14px; height: 14px; border: 1.5px solid rgba(0,0,0,0.2); border-top-color: var(--ink); border-radius: 50%; animation: spin 0.7s linear infinite; }

        .divider { display: flex; align-items: center; gap: 16px; margin: 28px 0; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 11px; letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase; }

        .switch-mode { text-align: center; font-size: 13px; color: var(--muted); }
        .switch-link { color: var(--pistachio); background: none; border: none; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; text-decoration: underline; text-underline-offset: 3px; transition: color 0.2s; }
        .switch-link:hover { color: var(--cream); }

        .back-link { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); text-decoration: none; margin-bottom: 48px; transition: color 0.2s; }
        .back-link:hover { color: var(--cream); }

        @media (max-width: 768px) {
          .auth-layout { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 40px 24px; }
        }
      `}</style>

      <div className="auth-layout">
        <div className="auth-left">
          <Link href="/" className="al-logo">AuraStyle</Link>
          <div className="al-center">
            <h2 className="al-quote">Moda është<br /><em>gjuha</em> që<br />flet pa fjalë.</h2>
            <p className="al-desc">Lejo AI të kurojë look-un tënd bazuar në preferencat tua personale.</p>
            <div className="al-tags">
              {['Outfit Suggester', 'Paleta Ngjyrash', 'Shqip & Gegë', 'Kosovë Style'].map(t => (
                <span key={t} className="al-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="geo-wrap">
            <div className="geo-ring gr-1" /><div className="geo-ring gr-2" /><div className="geo-ring gr-3" />
          </div>
          <span className="al-bottom">© 2025 AuraStyle</span>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <Link href="/" className="back-link">← Kthehu</Link>
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>Hyr</button>
              <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>Regjistrohu</button>
            </div>
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="field-group">
                  <label className="field-label">Emri</label>
                  <input type="text" placeholder="Emri yt" value={name} onChange={e => setName(e.target.value)} className="field-input" disabled={loading} />
                </div>
              )}
              <div className="field-group">
                <label className="field-label">Email</label>
                <input type="email" placeholder="email@shembull.com" value={email} onChange={e => setEmail(e.target.value)} pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" className="field-input" disabled={loading} required />
              </div>
              <div className="field-group">
                <label className="field-label">Fjalëkalimi</label>
                <div className="field-wrap">
                  <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 karaktere" value={password} onChange={e => setPassword(e.target.value)} className="field-input has-toggle" disabled={loading} required />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>{showPass ? '🙈' : '👁'}</button>
                </div>
              </div>
              {error && <div className="alert error"><span>⚠</span><span>{error}</span></div>}
              {success && <div className="alert success"><span>✓</span><span>{success}</span></div>}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><div className="spinner-sm" /> Duke procesuar...</> : mode === 'signin' ? 'Hyr në Llogari' : 'Krijo Llogarinë'}
              </button>
            </form>
            <div className="divider"><div className="divider-line" /><span className="divider-text">ose</span><div className="divider-line" /></div>
            <div className="switch-mode">
              {mode === 'signin' ? <>Nuk ke llogari? <button className="switch-link" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>Regjistrohu</button></> : <>Ke llogari? <button className="switch-link" onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>Hyr</button></>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}