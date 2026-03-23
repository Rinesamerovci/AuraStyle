'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0d0d0d;
          --cream: #f5f0e8;
          --pistachio: #9DC183;
          --pistachio-light: #A8D08D;
          --muted: #6b6560;
          --border: rgba(157, 193, 131, 0.2);
        }

        body {
          background: var(--ink);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 24px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: var(--cream);
          text-decoration: none;
          text-transform: uppercase;
        }

        .nav-actions { display: flex; align-items: center; gap: 32px; }

        .nav-link {
          font-size: 13px;
          letter-spacing: 0.08em;
          color: var(--muted);
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--cream); }

        .nav-cta {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          background: var(--pistachio);
          padding: 10px 24px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nav-cta:hover { background: var(--pistachio-light); }

        .hero {
          position: relative;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 140px 64px 80px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--pistachio);
          margin-bottom: 40px;
        }
        .hero-badge::before { content: ''; width: 32px; height: 1px; background: var(--pistachio); }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(64px, 7vw, 96px);
          font-weight: 300;
          line-height: 0.95;
          color: var(--cream);
          margin-bottom: 32px;
        }
        .hero-title em { font-style: italic; color: var(--pistachio); }

        .hero-sub {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--muted);
          max-width: 400px;
          margin-bottom: 56px;
        }

        .hero-actions { display: flex; align-items: center; gap: 24px; }

        .btn-primary {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          background: var(--cream);
          padding: 16px 36px;
          text-decoration: none;
          border: 1px solid var(--cream);
          transition: all 0.25s ease;
        }
        .btn-primary:hover { background: var(--pistachio); border-color: var(--pistachio); }

        .btn-ghost {
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--cream); }

        .hero-right { position: relative; overflow: hidden; }

        .hero-visual {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1a1510 0%, #0d0d0d 50%, #12100e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-visual::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 60% 40%, rgba(157,193,131,0.12) 0%, transparent 60%);
        }

        .fashion-circles { position: relative; width: 280px; height: 380px; }

        .fc-ring { position: absolute; border: 1px solid; border-radius: 50%; }
        .fc-ring-1 { width: 280px; height: 280px; top: 50px; left: 0; border-color: rgba(157,193,131,0.15); }
        .fc-ring-2 { width: 200px; height: 200px; top: 90px; left: 40px; border-color: rgba(157,193,131,0.25); }
        .fc-ring-3 { width: 120px; height: 120px; top: 130px; left: 80px; border-color: rgba(157,193,131,0.4); animation: rotateSlow 12s linear infinite; }
        .fc-core { position: absolute; width: 48px; height: 48px; top: 156px; left: 116px; background: var(--pistachio); border-radius: 50%; box-shadow: 0 0 40px rgba(157,193,131,0.5); }

        @keyframes rotateSlow { to { transform: rotate(360deg); } }

        .color-swatches { display: flex; gap: 12px; margin-top: 48px; }
        .swatch { width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); }

        .marquee-wrap {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 16px 0;
          overflow: hidden;
        }
        .marquee-track { display: flex; white-space: nowrap; animation: marquee 20s linear infinite; }
        .marquee-item { font-family: 'Cormorant Garamond', serif; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); padding: 0 40px; }
        .marquee-item span { color: var(--pistachio); margin-right: 40px; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .features { padding: 120px 64px; }

        .section-label {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--pistachio);
          margin-bottom: 64px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); max-width: 200px; }

        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }

        .feature-item { background: var(--ink); padding: 48px 40px; transition: background 0.3s; }
        .feature-item:hover { background: #111009; }

        .feature-num { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 300; color: var(--border); line-height: 1; margin-bottom: 24px; }
        .feature-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: var(--cream); margin-bottom: 12px; }
        .feature-desc { font-size: 14px; font-weight: 300; color: var(--muted); line-height: 1.7; }

        .cta-section { padding: 120px 64px; text-align: center; border-top: 1px solid var(--border); }

        .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(48px, 5vw, 72px); font-weight: 300; color: var(--cream); margin-bottom: 24px; }
        .cta-title em { font-style: italic; color: var(--pistachio); }
        .cta-sub { font-size: 15px; color: var(--muted); margin-bottom: 48px; }

        footer { border-top: 1px solid var(--border); padding: 32px 64px; display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
        .footer-copy { font-size: 12px; color: var(--muted); }

        @media (max-width: 768px) {
          nav { padding: 20px 24px; }
          .hero { grid-template-columns: 1fr; }
          .hero-left { padding: 120px 24px 60px; }
          .hero-right { display: none; }
          .features { padding: 80px 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 80px 24px; }
          footer { padding: 24px; flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <nav>
        <span className="nav-logo">AuraStyle</span>
        <div className="nav-actions">
          <Link href="/auth" className="nav-link">Hyr</Link>
          <Link href="/auth" className="nav-cta">Fillo Falas</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">AI Personal Shopper · Kosovë</div>
          <h1 className="hero-title">Stili yt.<br /><em>Personaliteti</em><br />yt.</h1>
          <p className="hero-sub">AuraStyle analizon preferencat e tua dhe gjeneron outfit-e të personalizuara, paleta ngjyrash dhe këshilla stili — në Shqip, Gegë dhe Anglisht.</p>
          <div className="hero-actions">
            <Link href="/auth" className="btn-primary">Fillo Tani</Link>
            <Link href="#features" className="btn-ghost">Mëso më shumë →</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-visual">
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="fashion-circles">
                <div className="fc-ring fc-ring-1" />
                <div className="fc-ring fc-ring-2" />
                <div className="fc-ring fc-ring-3" />
                <div className="fc-core" />
              </div>
              <div className="color-swatches">
                {['#9DC183','#A8D08D','#7CB342','#2c2416','#D4E5C4'].map(c => (
                  <div key={c} className="swatch" style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {['Casual', 'Formal', 'Dasëm', 'Minimale', 'Verore', 'Elegante', 'Streetwear'].map(t => (
                <span key={t} className="marquee-item"><span>✦</span>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="features" id="features">
        <div className="section-label">Si funksionon</div>
        <div className="features-grid">
          {[
            { n: '01', t: 'Përshkruaj stilin tënd', d: 'Trego rastin, moshën, preferencat dhe ne kujdesemi për pjesën tjetër.' },
            { n: '02', t: 'AI gjeneron outfit-in', d: 'Gjeneron sugjerime të personalizuara me paleta ngjyrash dhe këshilla praktike.' },
            { n: '03', t: 'Ruaj dhe krahaso', d: 'Koleksiono outfit-et e tua të preferuara dhe shiko historikun e këshillave.' },
          ].map(f => (
            <div key={f.n} className="feature-item">
              <div className="feature-num">{f.n}</div>
              <div className="feature-title">{f.t}</div>
              <div className="feature-desc">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Gati të ndryshosh<br /><em>stilin tënd?</em></h2>
        <p className="cta-sub">I lirë. Pa kartë krediti. Fillo menjëherë.</p>
        <Link href="/auth" className="btn-primary">Krijo Llogarinë</Link>
      </section>

      <footer>
        <span className="footer-logo">AuraStyle</span>
        <span className="footer-copy">© 2025 AuraStyle · Kosovë</span>
      </footer>
    </>
  );
}