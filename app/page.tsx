'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');    // pastro gabimin e vjetër
    setResponse(''); // pastro përgjigjen e vjetër

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
      setLoading(false); // ndal loading gjithmonë
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">AuraStyle</h1>
      <p className="text-gray-500 mb-8">AI Personal Shopper</p>

      {/* INPUT */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Përshkruaj veten: mosha, rasti, preferencat..."
          className="w-full p-3 border rounded-lg h-32 resize-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full bg-black text-white py-3 rounded-lg
            hover:bg-gray-800 disabled:opacity-40
            disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Duke menduar...' : 'Gjeneroj Outfit →'}
        </button>
      </form>

      {/* LOADING */}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-gray-500">
          <div className="animate-spin h-5 w-5 border-2 border-black
            border-t-transparent rounded-full" />
          <span>AI po analizon stilin tënd...</span>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200
          rounded-lg text-red-700">
          <strong>Gabim:</strong> {error}
          <button onClick={() => setError('')}
            className="ml-2 text-sm underline">Mbyll</button>
        </div>
      )}

      {/* RESPONSE */}
      {response && !loading && (
        <div className="mt-6 p-4 bg-green-50 border
          border-green-200 rounded-lg">
          <h2 className="font-semibold text-green-800 mb-2">
            Sugjerimi i AuraStyle:
          </h2>
          <p className="text-gray-800 whitespace-pre-wrap">
            {response}
          </p>
        </div>
      )}
    </main>
  );
}