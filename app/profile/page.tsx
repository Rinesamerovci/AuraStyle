'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppNav from '@/app/components/AppNav'
import { useAuth } from '@/app/lib/auth-context'
import {
  emptyStyleProfile,
  hasStyleProfile,
  normalizeStyleProfile,
  type StyleProfile,
} from '@/app/lib/style-profile'

export const dynamic = 'force-dynamic'

const GENDER_OPTIONS = [
  { value: '', label: 'Choose one' },
  { value: 'Woman', label: 'Woman / Girl' },
  { value: 'Man', label: 'Man / Boy' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
]

const SKIN_TONE_OPTIONS = [
  { value: '', label: 'Choose one' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Light', label: 'Light' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Tan', label: 'Tan' },
  { value: 'Deep', label: 'Deep' },
]

const UNDERTONE_OPTIONS = [
  { value: '', label: 'Choose one' },
  { value: 'Cool', label: 'Cool' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Warm', label: 'Warm' },
  { value: 'Olive', label: 'Olive' },
]

const FIT_OPTIONS = [
  { value: '', label: 'Choose one' },
  { value: 'Relaxed', label: 'Relaxed' },
  { value: 'Balanced', label: 'Balanced' },
  { value: 'Tailored', label: 'Tailored' },
  { value: 'Oversized', label: 'Oversized' },
  { value: 'Minimal', label: 'Minimal' },
]

function countCompletedFields(profile: StyleProfile) {
  return Object.values(profile).filter(Boolean).length
}

export default function ProfilePage() {
  const { user, loading, userProfile, updateStyleProfile } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<StyleProfile>(emptyStyleProfile)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!userProfile) return
    setForm(normalizeStyleProfile(userProfile.styleProfile))
  }, [userProfile])

  const completedFields = useMemo(() => countCompletedFields(form), [form])
  const profileReady = hasStyleProfile(form)

  const setField = (field: keyof StyleProfile, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.age) {
      const age = Number(form.age)
      if (Number.isNaN(age) || age < 12 || age > 100) {
        setError('Age should be a number between 12 and 100.')
        return
      }
    }

    setSaving(true)

    try {
      await updateStyleProfile(form)
      setSuccess('Your profile was saved. AuraStyle will now use it in future outfit suggestions.')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Profile could not be saved.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0d0d0d;
          --ink-2: #141210;
          --ink-3: #191715;
          --cream: #f5f0e8;
          --pistachio: #9dc183;
          --muted: #6b6560;
          --border: rgba(157,193,131,0.14);
          --border-strong: rgba(157,193,131,0.24);
        }
        body { background: var(--ink); color: var(--cream); font-family: 'DM Sans', sans-serif; }

        .profile-page { min-height: 100vh; padding-top: 64px; }
        .profile-shell { display: grid; grid-template-columns: 320px 1fr; min-height: calc(100vh - 64px); }
        .profile-aside {
          padding: 48px 36px;
          border-right: 1px solid var(--border);
          background: linear-gradient(180deg, var(--ink-2) 0%, #100f0e 100%);
        }
        .aside-eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--pistachio);
          margin-bottom: 20px;
        }
        .aside-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px;
          line-height: 1;
          font-weight: 500;
          margin-bottom: 18px;
        }
        .aside-copy {
          font-size: 14px;
          line-height: 1.7;
          color: var(--muted);
          margin-bottom: 28px;
        }
        .aside-meter {
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          padding: 18px;
        }
        .meter-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
        }
        .meter-track {
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .meter-fill {
          height: 100%;
          background: linear-gradient(90deg, #879d73 0%, var(--pistachio) 100%);
          transition: width 0.2s ease;
        }
        .meter-copy {
          font-size: 13px;
          color: var(--cream);
        }
        .aside-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }
        .aside-chip {
          border: 1px solid var(--border);
          color: var(--muted);
          padding: 8px 12px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .profile-main {
          padding: 56px 64px 72px;
          background:
            radial-gradient(circle at top right, rgba(157,193,131,0.08) 0%, transparent 30%),
            linear-gradient(180deg, var(--ink) 0%, #0f0e0d 100%);
        }
        .main-header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 40px;
          align-items: end;
        }
        .main-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 4vw, 54px);
          font-weight: 500;
          line-height: 1;
          margin-bottom: 10px;
        }
        .main-sub {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 640px;
        }
        .go-style {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          text-decoration: none;
          color: var(--ink);
          background: var(--pistachio);
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .profile-form {
          display: grid;
          gap: 28px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .form-card {
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          padding: 28px;
        }
        .card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          margin-bottom: 8px;
        }
        .card-copy {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field.full {
          grid-column: 1 / -1;
        }
        .field label {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .field input,
        .field select,
        .field textarea {
          width: 100%;
          background: var(--ink-3);
          border: 1px solid var(--border);
          color: var(--cream);
          padding: 14px 16px;
          font-family: inherit;
          font-size: 14px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          outline: none;
          border-color: var(--border-strong);
          background: rgba(157,193,131,0.06);
        }
        .field textarea {
          min-height: 120px;
          resize: vertical;
        }
        .helper {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.6;
        }
        .alert {
          border: 1px solid;
          padding: 14px 16px;
          font-size: 14px;
        }
        .alert.error {
          border-color: rgba(225, 98, 98, 0.4);
          background: rgba(225, 98, 98, 0.08);
          color: #f4a1a1;
        }
        .alert.success {
          border-color: rgba(157,193,131,0.4);
          background: rgba(157,193,131,0.08);
          color: #cfe0c1;
        }
        .actions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 28px;
        }
        .actions-copy {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 520px;
        }
        .save-btn {
          padding: 14px 24px;
          background: var(--pistachio);
          color: var(--ink);
          border: none;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          min-width: 180px;
        }
        .save-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 960px) {
          .profile-shell { grid-template-columns: 1fr; }
          .profile-aside { border-right: none; border-bottom: 1px solid var(--border); }
          .profile-main { padding: 40px 24px 56px; }
          .main-header { flex-direction: column; align-items: start; }
          .form-grid, .field-grid { grid-template-columns: 1fr; }
          .actions { flex-direction: column; align-items: start; }
        }
      `}</style>

      <AppNav />
      <div className="profile-page">
        <div className="profile-shell">
          <aside className="profile-aside">
            <div className="aside-eyebrow">Personal Styling Profile</div>
            <h1 className="aside-title">Make AuraStyle know you better.</h1>
            <p className="aside-copy">
              Save the details that influence color harmony, fit, and styling direction so future outfit ideas
              feel more personal and more accurate.
            </p>

            <div className="aside-meter">
              <div className="meter-label">Profile completion</div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: `${(completedFields / 9) * 100}%` }} />
              </div>
              <div className="meter-copy">
                {completedFields}/9 fields completed {profileReady ? 'and ready for AI styling.' : 'Fill a few fields to personalize outfits.'}
              </div>
            </div>

            <div className="aside-chip-row">
              <div className="aside-chip">Better color picks</div>
              <div className="aside-chip">Smarter fit ideas</div>
              <div className="aside-chip">More relevant outfits</div>
            </div>
          </aside>

          <main className="profile-main">
            <div className="main-header">
              <div>
                <h2 className="main-title">Your Styling Details</h2>
                <p className="main-sub">
                  AuraStyle will automatically use this profile whenever it generates outfit suggestions. You can
                  still add extra notes on the style page for each specific look.
                </p>
              </div>
              <a href="/style" className="go-style">Go To Generator</a>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <section className="form-card">
                <div className="card-title">Core Details</div>
                <div className="card-copy">
                  These fields help the app understand who the outfit is for before it starts thinking about colors
                  and silhouettes.
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="gender">Gender</label>
                    <select id="gender" value={form.gender} onChange={(event) => setField('gender', event.target.value)}>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value || 'empty-gender'} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="age">Age</label>
                    <input
                      id="age"
                      type="number"
                      min="12"
                      max="100"
                      placeholder="e.g. 21"
                      value={form.age}
                      onChange={(event) => setField('age', event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="skinTone">Skin Tone</label>
                    <select id="skinTone" value={form.skinTone} onChange={(event) => setField('skinTone', event.target.value)}>
                      {SKIN_TONE_OPTIONS.map((option) => (
                        <option key={option.value || 'empty-skin'} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="undertone">Undertone</label>
                    <select id="undertone" value={form.undertone} onChange={(event) => setField('undertone', event.target.value)}>
                      {UNDERTONE_OPTIONS.map((option) => (
                        <option key={option.value || 'empty-undertone'} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="form-card">
                <div className="card-title">Style Preferences</div>
                <div className="card-copy">
                  Add the fashion cues AuraStyle should prioritize when it decides cuts, palettes, and styling energy.
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="fitPreference">Fit Preference</label>
                    <select id="fitPreference" value={form.fitPreference} onChange={(event) => setField('fitPreference', event.target.value)}>
                      {FIT_OPTIONS.map((option) => (
                        <option key={option.value || 'empty-fit'} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="styleVibe">Style Vibe</label>
                    <input
                      id="styleVibe"
                      type="text"
                      placeholder="e.g. classy, soft glam, streetwear"
                      value={form.styleVibe}
                      onChange={(event) => setField('styleVibe', event.target.value)}
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="preferredColors">Favorite Colors</label>
                    <input
                      id="preferredColors"
                      type="text"
                      placeholder="e.g. olive, cream, black, dusty pink"
                      value={form.preferredColors}
                      onChange={(event) => setField('preferredColors', event.target.value)}
                    />
                    <div className="helper">Use commas if you want to list several colors.</div>
                  </div>

                  <div className="field full">
                    <label htmlFor="avoidColors">Colors To Avoid</label>
                    <input
                      id="avoidColors"
                      type="text"
                      placeholder="e.g. neon yellow, bright orange"
                      value={form.avoidColors}
                      onChange={(event) => setField('avoidColors', event.target.value)}
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="notes">Extra Notes</label>
                    <textarea
                      id="notes"
                      placeholder="Anything else the stylist should know: modesty preferences, comfort, body-confidence notes, fabrics you love, fabrics you avoid..."
                      value={form.notes}
                      onChange={(event) => setField('notes', event.target.value)}
                    />
                  </div>
                </div>
              </section>

              {error && <div className="alert error">{error}</div>}
              {success && <div className="alert success">{success}</div>}

              <div className="actions">
                <div className="actions-copy">
                  Once saved, these details are reused by the generator automatically, so you do not need to retype
                  them every time you ask for an outfit.
                </div>
                <button className="save-btn" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  )
}
