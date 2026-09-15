import { DragEvent, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api';

type Evidence = { ingredient?: string; name?: string; description?: string; reason?: string; reference?: string; ocr_ingredient?: string };
type Result = {
  status?: string;
  explanation?: string;
  reason?: string;
  ocr?: { text?: string; confidence?: number };
  decision?: { haram_evidence?: Evidence[]; mushbooh_evidence?: Evidence[] };
  ingredientsDetected?: Evidence[];
};

const statusLabels: Record<string, string> = {
  HARAM_DETECTED: 'Haram',
  MUSHBOOH_DETECTED: 'Mushbooh',
  NO_HARAM_MATCH: 'No Haram Match',
  INSUFFICIENT_OCR: 'Unable to Analyze',
};

export default function ProductAnalyzerPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState('Checking');

  useEffect(() => {
    apiRequest<{ connected?: boolean }>('/api/v1/product-analyzer/health')
      .then(data => setHealth(data.connected ? 'Online' : 'Unavailable'))
      .catch(() => setHealth('Unavailable'));
  }, []);

  const selectFile = (selected?: File) => {
    if (!selected) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(selected.type) || selected.size > 10 * 1024 * 1024) {
      setError('Use JPG, JPEG, PNG, or WEBP up to 10 MB.');
      return;
    }
    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const analyze = async () => {
    setError('');
    setResult(null);
    if (mode === 'image' && !file) return setError('Please select an ingredient label image.');
    if (mode === 'text' && text.trim().length < 3) return setError('Please enter a meaningful ingredient list.');
    setLoading(true);
    try {
      const options: RequestInit = { method: 'POST' };
      if (mode === 'image') {
        const form = new FormData();
        form.append('image', file as File);
        options.body = form;
      } else {
        options.body = JSON.stringify({ text: text.trim() });
      }
      setResult(await apiRequest<Result>(`/api/v1/product-analyzer/analyze${mode === 'text' ? '-text' : ''}`, options));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Analysis service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  };
  const evidence = result?.ingredientsDetected ||
    result?.decision?.haram_evidence?.concat(result.decision.mushbooh_evidence || []) || [];
  const label = result?.status ? statusLabels[result.status] || result.status : '';

  return (
    <section className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-r from-emerald-950 to-emerald-700 p-7 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">AI + OCR + ingredient rules</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">Halal/Haram Product Analyzer</h1>
              <p className="mt-3 max-w-2xl text-emerald-100">Screen an ingredient label or paste its ingredients for a preliminary result.</p>
            </div>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">Backend: {health}</span>
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex gap-2 rounded-xl bg-slate-100 p-1">
              <button onClick={() => setMode('image')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'image' ? 'bg-white text-emerald-700 shadow' : 'text-slate-600'}`}>Upload image</button>
              <button onClick={() => setMode('text')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'text' ? 'bg-white text-emerald-700 shadow' : 'text-slate-600'}`}>Enter text</button>
            </div>
            {mode === 'image' ? (
              preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Ingredient label preview" className="max-h-96 w-full rounded-2xl bg-slate-900 object-contain" />
                  <div className="flex gap-2">
                    <button onClick={() => fileInput.current?.click()} className="rounded-xl border px-4 py-2 text-sm font-bold">Replace</button>
                    <button onClick={() => { setFile(null); setPreview(''); }} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600">Remove</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInput.current?.click()} onDragOver={event => event.preventDefault()} onDrop={drop} className="cursor-pointer rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-12 text-center hover:border-emerald-500">
                  <p className="text-4xl">📷</p>
                  <p className="mt-3 font-bold text-slate-800">Drag and drop your label here</p>
                  <p className="mt-1 text-sm text-slate-500">JPG, JPEG, PNG, WEBP · maximum 10 MB</p>
                </div>
              )
            ) : (
              <textarea value={text} onChange={event => setText(event.target.value)} rows={12} placeholder="Ingredients: wheat flour, sugar, vegetable oil, E471…" className="w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm outline-none focus:border-emerald-500" />
            )}
            <input ref={fileInput} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={event => selectFile(event.target.files?.[0])} />
            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <button disabled={loading} onClick={analyze} className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? 'Analyzing label…' : 'Analyze ingredients'}</button>
          </div>
          <div className="rounded-3xl bg-slate-900 p-6 text-slate-100 shadow-sm">
            {!result && !loading && <div className="flex min-h-80 items-center justify-center text-center text-slate-400"><div><p className="text-5xl">🧾</p><p className="mt-3">Your result, explanation, OCR text, and evidence appear here.</p></div></div>}
            {loading && <div className="flex min-h-80 items-center justify-center"><p className="animate-pulse text-emerald-300">Reading label and checking ingredients…</p></div>}
            {result && !loading && <div className="space-y-5"><div><p className="text-xs uppercase tracking-widest text-emerald-300">Result</p><h2 className="mt-1 text-3xl font-black">{label}</h2><p className="mt-2 text-slate-300">{result.explanation || result.reason || 'No explanation was returned.'}</p></div>{result.ocr?.text && <details open><summary className="cursor-pointer font-bold text-emerald-300">Extracted ingredient text</summary><p className="mt-2 whitespace-pre-wrap rounded-xl bg-white/5 p-3 text-sm text-slate-300">{result.ocr.text}</p></details>}{evidence.length > 0 && <div><h3 className="font-bold text-emerald-300">Detected evidence</h3><div className="mt-2 space-y-2">{evidence.map((item, index) => <div key={`${item.ingredient || item.name}-${index}`} className="rounded-xl bg-white/5 p-3 text-sm"><strong>{item.ingredient || item.name}</strong><p className="text-slate-300">{item.description || item.reason}</p><small className="text-slate-400">{item.ocr_ingredient || item.reference}</small></div>)}</div></div>}<p className="border-t border-white/10 pt-4 text-xs text-slate-400">This automated screening is not official Halal certification. Verify doubtful ingredients with a qualified certification body.</p></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
