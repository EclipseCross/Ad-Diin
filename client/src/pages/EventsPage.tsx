import { useEffect, useMemo, useState } from 'react';
import { Clock3, MoonStar, Sun } from 'lucide-react';

type ApiResponse = {
  code: number;
  status: string;
  data?: {
    timings?: {
      Fajr?: string;
      Maghrib?: string;
    };
    date?: {
      readable?: string;
      hijri?: {
        day?: string;
        month?: { en?: string };
        year?: string;
      };
    };
  };
};

function sanitizeTime(rawTime: string): string {
  return rawTime.split(' ')[0]?.trim() || rawTime;
}

function getDhakaNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
}

function parseDhakaClock(timeText: string): Date | null {
  const clean = sanitizeTime(timeText);
  const parts = clean.split(':');
  if (parts.length < 2) return null;

  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  const base = getDhakaNow();
  base.setHours(h, m, 0, 0);
  return base;
}

function toTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export default function EventsPage() {
  const [sehriTime, setSehriTime] = useState('--:--');
  const [iftarTime, setIftarTime] = useState('--:--');
  const [metaLine, setMetaLine] = useState('Loading Dhaka, Bangladesh timing data...');
  const [error, setError] = useState('');
  const [sehriDate, setSehriDate] = useState<Date | null>(null);
  const [iftarDate, setIftarDate] = useState<Date | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [notice, setNotice] = useState('Countdown will start after loading timings.');

  useEffect(() => {
    let active = true;

    async function loadTiming() {
      try {
        setError('');
        const url =
          'https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=1';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch Ramadan timings.');

        const payload: ApiResponse = await res.json();
        const timings = payload?.data?.timings;
        if (!timings?.Fajr || !timings?.Maghrib) {
          throw new Error('Incomplete timing data from API.');
        }

        const fajr = sanitizeTime(timings.Fajr);
        const maghrib = sanitizeTime(timings.Maghrib);
        const fajrDate = parseDhakaClock(fajr);
        const maghribDate = parseDhakaClock(maghrib);
        if (!fajrDate || !maghribDate) throw new Error('Unable to parse prayer times.');

        if (!active) return;
        setSehriTime(fajr);
        setIftarTime(maghrib);
        setSehriDate(fajrDate);
        setIftarDate(maghribDate);

        const readable =
          payload?.data?.date?.readable ||
          getDhakaNow().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
        const hijriDay = payload?.data?.date?.hijri?.day;
        const hijriMonth = payload?.data?.date?.hijri?.month?.en;
        const hijriYear = payload?.data?.date?.hijri?.year;
        const hijriPart = hijriDay && hijriMonth && hijriYear
          ? `${hijriDay} ${hijriMonth}, ${hijriYear}`
          : 'Hijri date unavailable';

        setMetaLine(`DHAKA, BANGLADESH | ${readable} | ${hijriPart}`);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || 'Something went wrong while loading timings.');
        setMetaLine('Unable to load Ramadan timing data right now.');
      }
    }

    loadTiming();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sehriDate || !iftarDate) return;

    const tick = () => {
      const now = getDhakaNow();
      const total = iftarDate.getTime() - sehriDate.getTime();
      const left = iftarDate.getTime() - now.getTime();
      const elapsed = now.getTime() - sehriDate.getTime();

      if (left <= 0) {
        setRemainingMs(0);
        setProgressPct(100);
        setNotice('Iftar time has started. May Allah accept your fasting.');
        return;
      }

      setRemainingMs(left);

      if (now <= sehriDate) {
        setProgressPct(0);
        setNotice('Sehri has not ended yet. Fasting period will start soon.');
      } else {
        const p = Math.max(0, Math.min(100, (elapsed / total) * 100));
        setProgressPct(p);
        setNotice('Fasting day is in progress.');
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sehriDate, iftarDate]);

  const countdown = useMemo(() => {
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    return {
      h: toTwo(hours),
      m: toTwo(minutes),
      s: toTwo(seconds),
    };
  }, [remainingMs]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40 py-8 px-4 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center mb-7">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Today Sehri & Iftar Time Dhaka
          </h1>
          <p className="mt-3 text-sm md:text-xl text-slate-600">{metaLine}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-emerald-200 bg-white shadow-[0_12px_30px_rgba(16,185,129,0.10)] p-6 md:p-8">
            <p className="text-slate-700 font-bold uppercase tracking-wide text-lg flex items-center gap-2">
              <Sun className="w-5 h-5 text-emerald-500" />
              Dhaka Sehri Time Today
            </p>
            <p className="mt-4 text-5xl md:text-6xl font-extrabold text-emerald-600">{sehriTime}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white shadow-[0_12px_30px_rgba(16,185,129,0.10)] p-6 md:p-8">
            <p className="text-slate-700 font-bold uppercase tracking-wide text-lg flex items-center gap-2">
              <MoonStar className="w-5 h-5 text-emerald-500" />
              Dhaka Iftar Time Today
            </p>
            <p className="mt-4 text-5xl md:text-6xl font-extrabold text-emerald-600">{iftarTime}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-white shadow-[0_12px_30px_rgba(16,185,129,0.10)] p-6 md:p-8">
          <h2 className="text-center text-3xl md:text-5xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            <Clock3 className="w-8 h-8 text-emerald-500" />
            Iftar Remaining Time
          </h2>

          <div className="mt-6 flex items-center justify-center gap-3 md:gap-6">
            <div className="text-center min-w-20">
              <p className="text-5xl md:text-6xl font-black text-emerald-600">{countdown.h}</p>
              <p className="uppercase text-xs md:text-sm tracking-[0.2em] text-slate-500 mt-1">Hours</p>
            </div>
            <div className="text-4xl md:text-5xl text-emerald-400 font-black">:</div>
            <div className="text-center min-w-20">
              <p className="text-5xl md:text-6xl font-black text-emerald-600">{countdown.m}</p>
              <p className="uppercase text-xs md:text-sm tracking-[0.2em] text-slate-500 mt-1">Minutes</p>
            </div>
            <div className="text-4xl md:text-5xl text-emerald-400 font-black">:</div>
            <div className="text-center min-w-20">
              <p className="text-5xl md:text-6xl font-black text-emerald-600">{countdown.s}</p>
              <p className="uppercase text-xs md:text-sm tracking-[0.2em] text-slate-500 mt-1">Seconds</p>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-slate-700 text-sm md:text-lg font-semibold mb-2">
              <span>{sehriTime}</span>
              <span>{iftarTime}</span>
            </div>

            <div className="h-4 rounded-full bg-emerald-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <p className="mt-3 text-center text-emerald-600 font-bold text-xl">
              {Math.floor(progressPct)}% fasting completed
            </p>
            <p className="mt-1 text-center text-slate-600 text-sm md:text-base">{notice}</p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
