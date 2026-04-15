'use client';

import { useAuth } from '@/app/lib/auth-context';
import { useEffect, useState } from 'react';
import { getOutfits, deleteOutfit as dbDeleteOutfit, updateOutfit, OutfitRecord } from '@/app/lib/outfits-db';
import AppNav from '@/app/components/AppNav';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic'

const outfitDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export default function OutfitsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [outfits, setOutfits] = useState<OutfitRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  // Load outfits from Supabase when user changes
  useEffect(() => {
    if (!user?.id) {
      setPageLoading(false);
      return;
    }

    const loadOutfits = async () => {
      try {
        setPageLoading(true);
        setError(null);
        const data = await getOutfits();
        setOutfits(data || []);
      } catch (err) {
        console.error('Failed to load outfits:', err);
        setError('Failed to load outfits. Please try refreshing.');
      } finally {
        setPageLoading(false);
      }
    };

    loadOutfits();
  }, [user?.id]);

  const deleteOutfit = async (id: string) => {
    try {
      await dbDeleteOutfit(id);
      setOutfits(outfits.filter(o => o.id !== id));
    } catch (err) {
      console.error('Failed to delete outfit:', err);
      setError('Failed to delete outfit. Please try again.');
    }
  };

  const saveEdit = async (id: string) => {
    try {
      const outfit = outfits.find(o => o.id === id);
      if (!outfit) return;

      // Update in Supabase
      await updateOutfit(id, { color_palette: editValue });

      // Update local state
      setOutfits(outfits.map(o =>
        o.id === id ? { ...o, color_palette: editValue } : o
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save outfit:', err);
      setError('Failed to save outfit. Please try again.');
    }
  };

  if (loading || !user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0d0d0d;
          --ink-2: #111009;
          --cream: #f5f0e8;
          --pistachio: #9DC183;
          --muted: #6b6560;
          --border: rgba(157,193,131,0.12);
          --border-bright: rgba(157,193,131,0.2);
        }

        body { background: var(--ink); color: var(--cream); font-family: 'DM Sans', sans-serif; }

        .outfits-page { padding-top: 64px; min-height: 100vh; }
        
        .outfits-hero {
          border-bottom: 1px solid var(--border);
          padding: 72px 64px 56px;
          position: relative;
          overflow: hidden;
        }

        .outfits-hero::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(157,193,131,0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        .outfits-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 4vw, 56px);
          font-weight: 300;
          color: var(--cream);
          line-height: 1.1;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .outfits-sub {
          font-size: 14px;
          color: var(--muted);
          font-weight: 300;
          margin-top: 16px;
          position: relative;
          z-index: 1;
        }

        .outfits-body {
          padding: 56px 64px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .error-banner {
          background: rgba(200, 50, 50, 0.15);
          border: 1px solid rgba(200, 50, 50, 0.3);
          border-left: 3px solid rgba(200, 50, 50, 0.6);
          padding: 20px 24px;
          margin-bottom: 40px;
          font-size: 14px;
          color: #e8a8a8;
          border-radius: 2px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
        }

        .empty-icon {
          font-size: 56px;
          margin-bottom: 24px;
          opacity: 0.4;
        }

        .empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 12px;
        }

        .empty-text {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 32px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .empty-link {
          display: inline-block;
          background: var(--pistachio);
          color: var(--ink);
          padding: 12px 32px;
          text-decoration: none;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: filter 0.2s, transform 0.2s;
        }

        .empty-link:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }

        .outfits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .outfit-card {
          background: var(--ink-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          min-height: 200px;
        }

        .outfit-card:hover {
          border-color: var(--border-bright);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .outfit-card.expanded {
          min-height: auto;
        }

        .outfit-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, var(--ink-2) 0%, rgba(157,193,131,0.02) 100%);
        }

        .outfit-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          color: var(--cream);
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .outfit-preview {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .expand-indicator {
          position: absolute;
          bottom: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: var(--pistachio);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink);
          font-size: 14px;
          transition: transform 0.3s ease;
        }

        .outfit-card.expanded .expand-indicator {
          transform: rotate(180deg);
        }

        .outfit-content {
          padding: 24px;
          display: none;
        }

        .outfit-card.expanded .outfit-content {
          display: block;
        }

        .outfit-delete-btn {
          background: transparent;
          border: 1px solid rgba(200, 50, 50, 0.3);
          color: rgba(200, 50, 50, 0.8);
          padding: 8px 16px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          border-radius: 4px;
        }

        .outfit-delete-btn:hover {
          background: rgba(200, 50, 50, 0.15);
          border-color: rgba(200, 50, 50, 0.6);
          color: #e8a8a8;
        }

        .outfit-content { margin-bottom: 24px; }

        .palette-label {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .palette-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: var(--cream);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .outfit-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .edit-box { margin-bottom: 16px; }

        .edit-textarea {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-bright);
          color: var(--cream);
          padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          line-height: 1.6;
          resize: vertical;
          min-height: 100px;
          margin-bottom: 12px;
        }

        .edit-textarea::placeholder { color: var(--muted); }
        .edit-textarea:focus { outline: none; border-color: var(--pistachio); }

        .btn-base {
          padding: 10px 16px;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          border: none;
        }

        .btn-save {
          background: var(--pistachio);
          color: var(--ink);
        }

        .btn-save:hover { filter: brightness(1.1); }

        .btn-cancel {
          background: transparent;
          border: 1px solid var(--border-bright);
          color: var(--muted);
        }

        .btn-cancel:hover {
          border-color: var(--cream);
          color: var(--cream);
        }

        .btn-edit {
          background: transparent;
          border: 1px solid var(--border-bright);
          color: var(--pistachio);
        }

        .btn-edit:hover {
          border-color: var(--pistachio);
          background: rgba(157,193,131,0.1);
        }

        .outfit-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .meta-item {
          font-size: 13px;
          color: var(--muted);
        }

        .meta-label {
          color: var(--pistachio);
          font-weight: 500;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 2px solid var(--border-bright);
          border-top-color: var(--pistachio);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .outfits-hero { padding: 48px 24px 40px; }
          .outfits-body { padding: 40px 24px; }
          .outfits-grid { grid-template-columns: 1fr; }
          .outfit-card { min-height: 160px; }
          .outfit-header { padding: 20px; }
          .outfit-content { padding: 20px; }
          .outfit-title { font-size: 16px; }
          .expand-indicator { width: 28px; height: 28px; font-size: 12px; }
        }
      `}</style>

      <AppNav />
      <div className="outfits-page">
        <div className="outfits-hero">
          <h1 className="outfits-title">My Outfits</h1>
          <p className="outfits-sub">Collection of your saved styling recommendations</p>
        </div>

        <div className="outfits-body">
          {error && <div className="error-banner">{error}</div>}

          {pageLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : outfits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h2 className="empty-title">No saved outfits yet</h2>
              <p className="empty-text">Start creating your personalized outfit recommendations</p>
              <a href="/style" className="empty-link">Generate Your First Outfit</a>
            </div>
          ) : (
            <div className="outfits-grid">
              {outfits.map((outfit) => (
                <div 
                  key={outfit.id} 
                  className={`outfit-card ${expandedId === outfit.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedId(expandedId === outfit.id ? null : outfit.id)}
                >
                  <div className="outfit-header">
                    <div>
                      <div className="outfit-title">{outfit.outfit_description}</div>
                      <div className="outfit-preview">
                        {outfit.color_palette?.substring(0, 120)}...
                      </div>
                    </div>
                    <div className="expand-indicator">↓</div>
                  </div>

                  <div className="outfit-content">
                    <div className="palette-label">Color Palette</div>
                    {editingId === outfit.id ? (
                      <div className="edit-box">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="edit-textarea"
                          rows={4}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="outfit-actions">
                          <button 
                            onClick={(e) => { e.stopPropagation(); saveEdit(outfit.id); }} 
                            className="btn-base btn-save"
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }} 
                            className="btn-base btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="palette-text">{outfit.color_palette}</div>
                        <div className="outfit-actions">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(outfit.id); setEditValue(outfit.color_palette); }}
                            className="btn-base btn-edit"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteOutfit(outfit.id); }} 
                            className="outfit-delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="outfit-meta">
                      {outfit.style_tips && (
                        <div className="meta-item">
                          <span className="meta-label">Tips:</span> {outfit.style_tips}
                        </div>
                      )}
                      {outfit.rating && (
                        <div className="meta-item">
                          <span className="meta-label">Rating:</span> {outfit.rating}/5
                        </div>
                      )}
                      <div className="meta-item">
                        <span className="meta-label">Created:</span> {outfitDateFormatter.format(new Date(outfit.created_at))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
