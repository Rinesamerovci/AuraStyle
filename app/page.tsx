'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error('Gabim nga serveri: ' + res.status);

      const data = await res.json();
      setResponse(data.reply);
    } catch (err: any) {
      setError(err.message || 'Diçka shkoi gabim. Provo përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #09090b;
          background-image: radial-gradient(circle at 50% 0%, #18181b 0%, #09090b 70%);
          color: #fafafa;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px;
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
        }

        .eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a1a1aa;
          margin-bottom: 12px;
        }

        .logo {
          font-family: 'Outfit', sans-serif;
          font-size: 56px;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #c084fc 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .tagline {
          font-size: 15px;
          font-weight: 400;
          color: #71717a;
        }

        .card {
          width: 100%;
          max-width: 620px;
          background: rgba(24, 24, 27, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 24px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }

        .label {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #e4e4e7;
          margin-bottom: 12px;
          display: block;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 28px;
        }

        .chip {
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: #a1a1aa;
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.2s ease;
        }

        .chip:hover { 
          border-color: rgba(255, 255, 255, 0.2); 
          color: #fafafa; 
        }

        .chip.active {
          border-color: #8b5cf6;
          background: #8b5cf6;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
        }

        textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #fafafa;
          resize: none;
          height: 120px;
          outline: none;
          transition: all 0.2s ease;
          line-height: 1.6;
        }

        textarea::placeholder { color: #52525b; }
        
        textarea:focus { 
          border-color: #8b5cf6;
          background: rgba(0, 0, 0, 0.3);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }
        
        textarea:disabled { opacity: 0.5; }

        .submit-btn {
          width: 100%;
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          border: none;
          border-radius: 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .submit-btn:hover:not(:disabled) { 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); 
        }

        .submit-btn:disabled {
          background: #27272a;
          color: #52525b;
          box-shadow: none;
          cursor: not-allowed;
        }

        .loading-wrap {
          width: 100%;
          max-width: 620px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px 0;
          background: rgba(24, 24, 27, 0.4);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #a1a1aa;
        }

        .response-card {
          width: 100%;
          max-width: 620px;
          background: rgba(24, 24, 27, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 24px;
          padding: 40px;
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .response-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a78bfa;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .response-eyebrow::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #a78bfa;
          border-radius: 50%;
          box-shadow: 0 0 10px #a78bfa;
        }

        .response-text {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: #e4e4e7;
          white-space: pre-wrap;
        }

        .error-card {
          width: 100%;
          max-width: 620px;
          background: rgba(225, 29, 72, 0.1);
          border: 1px solid rgba(225, 29, 72, 0.3);
          border-radius: 16px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .error-text {
          font-size: 14px;
          color: #fda4af;
          font-weight: 400;
        }

        .error-label {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f43f5e;
          margin-bottom: 4px;
        }

        .error-close {
          background: none;
          border: none;
          color: #fda4af;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          transition: opacity 0.2s;
        }
        
        .error-close:hover { opacity: 0.7; }

        .new-btn {
          margin-top: 32px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 500;
          color: #a1a1aa;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .new-btn:hover { 
          color: #fafafa; 
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="page">
        <div className="header">
          <div className="eyebrow">AI Personal Shopper</div>
          <div className="logo">AuraStyle</div>
          <div className="tagline">Këshilla mode të personalizuara</div>
        </div>

        <div className="card">
          <span className="label">Zgjidh rastin</span>
          <div className="chips">
            {['Casual', 'Formal', 'Natë', 'Dasëm', 'Verore', 'Minimale'].map(c => (
              <button
                key={c}
                className={`chip ${input.includes(c) ? 'active' : ''}`}
                onClick={() => setInput(prev => prev + (prev ? ', ' : '') + c)}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>

          <span className="label">Përshkruaj detajet</span>
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="p.sh. 24 vjeç, dal darkë të shtunën, preferoj ngjyra neutrale dhe stil të rehatshëm..."
              disabled={loading}
            />
            <button
              className="submit-btn"
              type="submit"
              disabled={loading || !input.trim()}
            >
              {loading ? 'Duke analizuar...' : 'Gjenero Outfitin'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <span className="loading-text">AI po kuron look-un tënd...</span>
          </div>
        )}

        {error && !loading && (
          <div className="error-card">
            <div>
              <div className="error-label">Gabim</div>
              <div className="error-text">{error}</div>
            </div>
            <button className="error-close" onClick={() => setError('')}>✕</button>
          </div>
        )}

        {response && !loading && (
          <div className="response-card">
            <div className="response-eyebrow">Sugjerimi yt</div>
            <div className="response-text">{response}</div>
            <button className="new-btn" onClick={() => { setResponse(''); setInput(''); }}>
              <span>←</span> Kërkim i ri
            </button>
          </div>
        )}
      </div>
    </>
  );
}