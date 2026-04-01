'use client';

import { useAuth } from '@/app/lib/auth-context';
import { useEffect, useState } from 'react';
import { getOutfits, deleteOutfit as dbDeleteOutfit, updateOutfit, OutfitRecord } from '@/app/lib/outfits-db';

export default function OutfitsPage() {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<OutfitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load outfits from Supabase when user changes
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadOutfits = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOutfits();
        setOutfits(data || []);
      } catch (err) {
        console.error('Failed to load outfits:', err);
        setError('Failed to load outfits. Please try refreshing.');
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading your outfits...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Outfits</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {outfits.length === 0 ? (
        <p className="text-gray-600 text-lg">
          No saved outfits yet. Go to the{' '}
          <a href="/style" className="text-blue-500 hover:underline">
            Style page
          </a>
          {' '}to create one!
        </p>
      ) : (
        <div className="grid gap-4">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-semibold">Outfit Description:</p>
                  <p className="mb-2 text-gray-800">{outfit.outfit_description}</p>
                </div>
                <button
                  onClick={() => deleteOutfit(outfit.id)}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm whitespace-nowrap"
                >
                  Delete
                </button>
              </div>

              {editingId === outfit.id ? (
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-2">Color Palette:</p>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full border rounded p-2 mb-2 font-mono text-sm"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(outfit.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-2">Color Palette:</p>
                  <p className="mb-4 text-gray-800 whitespace-pre-wrap">{outfit.color_palette}</p>
                  <button
                    onClick={() => {
                      setEditingId(outfit.id);
                      setEditValue(outfit.color_palette);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm mr-2"
                  >
                    Edit
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 flex-wrap text-sm text-gray-600">
                {outfit.style_tips && <span>✨ Tips: {outfit.style_tips}</span>}
                {outfit.rating && <span>⭐ Rating: {outfit.rating}/5</span>}
                <span>📅 Created: {new Date(outfit.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
