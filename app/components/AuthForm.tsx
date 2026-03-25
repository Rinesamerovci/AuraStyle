'use client'

import { useState } from 'react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSubmit: (email: string, password: string, name?: string) => Promise<void>
  loading: boolean
  error: string
  setError: (error: string) => void
}

export default function AuthForm({ mode, onSubmit, loading, error, setError }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Plotëso të gjitha fushat.')
      return
    }

    if (password.length < 6) {
      setError('Fjalëkalimi duhet të ketë të paktën 6 karaktere.')
      return
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Emri është i detyrueshëm.')
      return
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError('Shkruaj një email të vlefshëm.')
      return
    }

    await onSubmit(email, password, mode === 'signup' ? name : undefined)
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {mode === 'signup' && (
        <div className="form-group">
          <label htmlFor="name">Emri</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Shkruaj emrin tënd"
            disabled={loading}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Shkruaj emailin tënd"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Fjalëkalimi</label>
        <div className="password-input">
          <input
            id="password"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Të paktën 6 karaktere"
            disabled={loading}
          />
          <button
            type="button"
            className="toggle-pass"
            onClick={() => setShowPass(!showPass)}
            disabled={loading}
          >
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button
        type="submit"
        className="form-submit"
        disabled={loading}
      >
        {loading ? 'Po punohet...' : mode === 'signin' ? 'Hyr' : 'Bëhu Anëtar'}
      </button>

      <style>{`
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b6560;
        }

        .form-group input {
          background: rgba(157, 193, 131, 0.04);
          border: 1px solid rgba(157, 193, 131, 0.2);
          color: #f5f0e8;
          padding: 12px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .form-group input:hover {
          border-color: rgba(157, 193, 131, 0.4);
        }

        .form-group input:focus {
          outline: none;
          border-color: #9DC183;
          background: rgba(157, 193, 131, 0.08);
        }

        .password-input {
          position: relative;
          display: flex;
        }

        .password-input input {
          flex: 1;
        }

        .toggle-pass {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.6;
          transition: opacity 0.2s;
          padding: 0 4px;
        }

        .toggle-pass:hover {
          opacity: 1;
        }

        .form-error {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.4);
          color: #ff6b7a;
          padding: 12px;
          font-size: 13px;
          border-radius: 2px;
        }

        .form-submit {
          background: #9DC183;
          color: #0d0d0d;
          padding: 12px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .form-submit:hover:not(:disabled) {
          background: #a8d08d;
          transform: translateY(-1px);
        }

        .form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  )
}
