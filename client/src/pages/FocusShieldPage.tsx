import { useState } from 'react';
import { apiBaseUrl } from '../api';

export default function FocusShieldPage() {
  const domain = new URLSearchParams(window.location.search).get('domain') || 'Social Media';
  const [passed, setPassed] = useState(false);
  const requestPass = () => { localStorage.setItem(`addiin_pass_${domain}`, String(Date.now() + 300000)); setPassed(true); };
  return <section className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-center text-white"><div className="max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><div className="text-5xl">🛡️</div><p className="mt-5 text-xs font-bold uppercase tracking-widest text-amber-300">Digital Fast · Distraction blocked</p><h1 className="mt-3 text-3xl font-black">{domain} is paused</h1><p className="mt-3 text-slate-400">Access is paused while Focus Shield is active.</p><div className="my-7 rounded-2xl border border-emerald-800 bg-emerald-950/50 p-5"><p className="text-2xl text-amber-200">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</p><p className="mt-3 text-sm italic text-slate-300">By the remembrance of Allah hearts are assured. — Surah Ar-Ra'd 13:28</p></div>{passed ? <a href={`https://${domain}`} className="block rounded-xl bg-emerald-600 px-4 py-3 font-bold">Continue for five minutes</a> : <button onClick={requestPass} className="w-full rounded-xl border border-slate-700 px-4 py-3 font-bold hover:bg-slate-800">Temporary 5-minute pass</button>}<a href={`${apiBaseUrl || ''}/focus`} className="mt-3 block text-sm text-emerald-300">Open Focus Dashboard</a></div></section>;
}
