import { useEffect, useState } from 'react';
import {
  apiRequest,
  apiBaseUrl,
} from '../api';

type PlatformKey =
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'tiktok'
  | 'youtube';

type Platforms =
  Record<PlatformKey, boolean>;

const platformDomains: Record<
  PlatformKey,
  string[]
> = {
  facebook: [
    'facebook.com',
    'messenger.com',
  ],
  instagram: [
    'instagram.com',
  ],
  x: [
    'x.com',
    'twitter.com',
  ],
  tiktok: [
    'tiktok.com',
  ],
  youtube: [
    'youtube.com',
  ],
};

const platformNames: Record<
  PlatformKey,
  string
> = {
  facebook:
    'Facebook and Messenger',
  instagram:
    'Instagram',
  x:
    'X / Twitter',
  tiktok:
    'TikTok',
  youtube:
    'YouTube',
};

const defaultPlatforms: Platforms = {
  facebook: true,
  instagram: true,
  x: true,
  tiktok: true,
  youtube: true,
};

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(
      /^https?:\/\//,
      ''
    )
    .split('/')[0]
    .replace(
      /[^a-z0-9.-]/g,
      ''
    );

function readJson<T>(
  key: string,
  fallback: T
): T {
  try {
    const value =
      localStorage.getItem(key);

    return value
      ? (JSON.parse(value) as T)
      : fallback;
  } catch {
    return fallback;
  }
}

export default function FocusPage() {
  const [active, setActive] =
    useState(
      localStorage.getItem(
        'addiin_shield_active'
      ) === 'true'
    );

  const [platforms, setPlatforms] =
    useState<Platforms>(
      readJson(
        'addiin_blocked_platforms',
        defaultPlatforms
      )
    );

  const [custom, setCustom] =
    useState<string[]>(
      readJson(
        'addiin_custom_domains',
        []
      )
    );

  const [domain, setDomain] =
    useState('');

  const [minutes, setMinutes] =
    useState(25);

  const [remaining, setRemaining] =
    useState(1500);

  const [running, setRunning] =
    useState(false);

  const [configState, setConfigState] =
    useState<
      'loading' | 'ready' | 'error'
    >('loading');

  // Check whether Laravel's extension configuration endpoint is reachable.
  useEffect(() => {
    apiRequest('/api/v1/focus/extension')
      .then(() =>
        setConfigState('ready')
      )
      .catch(() =>
        setConfigState('error')
      );
  }, []);

  // Focus timer
  useEffect(() => {
    if (!running) return;

    const timer =
      window.setInterval(() => {
        setRemaining(value =>
          value > 0
            ? value - 1
            : 0
        );
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, [running]);

  // Automatically stop the shield when timer ends.
  useEffect(() => {
    if (
      running &&
      remaining === 0
    ) {
      setRunning(false);
      setActive(false);
      persist(false);
    }
  }, [
    remaining,
    running,
  ]);

  const persist = (
    nextActive = active,
    nextPlatforms = platforms,
    nextCustom = custom
  ) => {
    localStorage.setItem(
      'addiin_shield_active',
      String(nextActive)
    );

    localStorage.setItem(
      'addiin_blocked_platforms',
      JSON.stringify(nextPlatforms)
    );

    localStorage.setItem(
      'addiin_custom_domains',
      JSON.stringify(nextCustom)
    );

    window.postMessage(
      {
        type:
          'ADDIIN_SHIELD_UPDATE',
        active: nextActive,
        platforms:
          nextPlatforms,
        custom:
          nextCustom,
      },
      '*'
    );
  };

  const toggleShield = () => {
    const next = !active;

    setActive(next);

    persist(next);
  };

  const display =
    `${String(
      Math.floor(
        remaining / 60
      )
    ).padStart(2, '0')}:${String(
      remaining % 60
    ).padStart(2, '0')}`;

  const platformKeys =
    Object.keys(
      platformDomains
    ) as PlatformKey[];

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <header className="rounded-3xl bg-gradient-to-r from-slate-950 to-indigo-950 p-7 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Digital Fast
              </p>

              <h1 className="mt-2 text-4xl font-black">
                Focus Shield
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                Choose the websites you want
                to pause while you pray, study,
                or protect your attention.
              </p>
            </div>

            <button
              onClick={toggleShield}
              className={`rounded-xl px-5 py-3 font-bold ${
                active
                  ? 'bg-red-500'
                  : 'bg-emerald-500'
              }`}
            >
              {active
                ? 'Turn Shield OFF'
                : 'Turn Shield ON'}
            </button>
          </div>

          <p className="mt-5 font-bold">
            {active
              ? 'Shield active: selected websites are blocked.'
              : 'Shield inactive: websites are unblocked.'}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Focus Timer */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-800">
              Focus timer
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Starting a timer automatically
              activates the shield.
            </p>

            <div className="my-8 text-center font-mono text-6xl font-black text-indigo-700">
              {display}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[15, 25, 45, 60].map(
                value => (
                  <button
                    key={value}
                    disabled={running}
                    onClick={() => {
                      setMinutes(value);
                      setRemaining(
                        value * 60
                      );
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      minutes === value
                        ? 'border-indigo-600 bg-indigo-50'
                        : ''
                    }`}
                  >
                    {value} min
                  </button>
                )
              )}
            </div>

            <div className="mt-5 flex justify-center gap-2">

              <button
                onClick={() => {
                  setActive(true);
                  setRunning(true);
                  persist(true);
                }}
                disabled={running}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                Start
              </button>

              <button
                onClick={() =>
                  setRunning(false)
                }
                className="rounded-xl bg-amber-500 px-5 py-3 font-bold text-white"
              >
                Pause
              </button>

              <button
                onClick={() => {
                  setRunning(false);
                  setRemaining(
                    minutes * 60
                  );
                }}
                className="rounded-xl border px-5 py-3 font-bold"
              >
                Stop
              </button>

            </div>
          </div>

          {/* Websites */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black text-slate-800">
              Websites to block
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Turn a category on or off.
              The browser extension blocks
              these domains only when the
              shield is active.
            </p>

            <div className="mt-4 space-y-3">
              {platformKeys.map(
                key => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <span>
                      <strong className="block">
                        {platformNames[key]}
                      </strong>

                      <small className="text-slate-500">
                        {platformDomains[
                          key
                        ].join(', ')}
                      </small>
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        platforms[key] !==
                        false
                      }
                      onChange={event => {
                        const next = {
                          ...platforms,
                          [key]:
                            event.target.checked,
                        };

                        setPlatforms(next);

                        persist(
                          active,
                          next
                        );
                      }}
                      className="h-5 w-5 accent-emerald-600"
                    />
                  </label>
                )
              )}
            </div>

            <div className="mt-5 flex gap-2">

              <input
                value={domain}
                onChange={event =>
                  setDomain(
                    event.target.value
                  )
                }
                placeholder="example.com"
                className="min-w-0 flex-1 rounded-xl border px-3 py-2"
              />

              <button
                onClick={() => {
                  const value =
                    normalize(domain);

                  if (
                    !value ||
                    custom.includes(value)
                  ) {
                    return;
                  }

                  const next = [
                    ...custom,
                    value,
                  ];

                  setCustom(next);
                  setDomain('');

                  persist(
                    active,
                    platforms,
                    next
                  );
                }}
                className="rounded-xl bg-emerald-600 px-4 font-bold text-white"
              >
                Add
              </button>

            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {custom.map(
                item => (
                  <button
                    key={item}
                    onClick={() => {
                      const next =
                        custom.filter(
                          value =>
                            value !== item
                        );

                      setCustom(next);

                      persist(
                        active,
                        platforms,
                        next
                      );
                    }}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                  >
                    {item} ×
                  </button>
                )
              )}
            </div>

          </div>
        </div>

        {/* Browser Extension */}
        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">

          <h2 className="font-black text-indigo-950">
            Browser extension
          </h2>

          <p className="mt-2 text-sm text-indigo-900">
            Install the unpacked extension
            from{' '}
            <code>
              server/public/extension
            </code>{' '}
            in Chrome or Edge, then keep
            this page open once to synchronize
            your settings.
          </p>

          <p
            className={`mt-3 text-sm font-bold ${
              configState === 'ready'
                ? 'text-emerald-700'
                : 'text-red-700'
            }`}
          >
            {configState === 'loading'
              ? 'Checking extension configuration…'
              : configState === 'ready'
                ? 'Extension configuration is available.'
                : 'Extension configuration could not be reached. Check the Laravel server/API URL.'}
          </p>

          {/* apiBaseUrl is now properly imported and actually used */}
          <a
            href={`${apiBaseUrl}/extension.zip`}
            download
            className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
          >
            Download Focus Shield extension
          </a>

          <p className="mt-2 text-xs text-indigo-800">
            After downloading, extract the ZIP
            and choose the extracted folder at
            chrome://extensions or
            edge://extensions.
          </p>

        </div>
      </div>
    </section>
  );
}