<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ramadan Timing Dashboard</title>
    <style>
        :root {
            --bg: #07110b;
            --bg-2: #0b1a11;
            --card: rgba(25, 38, 30, 0.9);
            --card-glow: rgba(66, 153, 74, 0.18);
            --text: #e9f3eb;
            --muted: #b3c4b6;
            --accent: #57b35f;
            --accent-soft: #2c6c34;
            --danger: #f7c948;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: var(--text);
            background:
                radial-gradient(900px 500px at 15% -15%, #123722 0%, transparent 65%),
                radial-gradient(800px 450px at 100% 0%, #102f1f 0%, transparent 60%),
                linear-gradient(160deg, var(--bg) 0%, #050b08 100%);
            padding: 30px 16px 40px;
        }

        .dashboard {
            max-width: 1060px;
            margin: 0 auto;
        }

        .top {
            text-align: center;
            margin-bottom: 24px;
        }

        .title {
            font-size: clamp(1.8rem, 2.8vw, 3rem);
            margin: 0;
            letter-spacing: 0.2px;
        }

        .subtitle {
            margin-top: 8px;
            color: var(--muted);
            font-size: clamp(0.95rem, 1.6vw, 1.2rem);
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            margin-bottom: 20px;
        }

        .card {
            background: linear-gradient(115deg, rgba(34, 53, 42, 0.75) 0%, rgba(21, 35, 28, 0.95) 100%);
            border: 1px solid rgba(95, 148, 103, 0.18);
            border-radius: 16px;
            padding: 24px;
            box-shadow: inset 0 0 80px var(--card-glow), 0 18px 35px rgba(0, 0, 0, 0.28);
        }

        .label {
            color: #d4dfd5;
            font-size: 1.05rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .time {
            margin-top: 16px;
            color: var(--accent);
            font-size: clamp(2rem, 4vw, 3.4rem);
            font-weight: 800;
            letter-spacing: 1px;
            line-height: 1;
        }

        .countdown-card {
            margin-top: 10px;
            background: linear-gradient(115deg, rgba(31, 47, 39, 0.88) 0%, rgba(16, 26, 21, 0.98) 100%);
        }

        .countdown-title {
            margin: 0;
            font-size: clamp(1.3rem, 2.2vw, 2rem);
            text-align: center;
            color: #ecf4ec;
        }

        .countdown {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
        }

        .time-chunk {
            min-width: 86px;
            text-align: center;
        }

        .digits {
            color: var(--accent);
            font-size: clamp(2rem, 3.8vw, 3.4rem);
            font-weight: 800;
            line-height: 1;
        }

        .chunk-label {
            margin-top: 6px;
            color: #9eb8a1;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 1.3px;
            font-weight: 700;
        }

        .colon {
            color: var(--accent-soft);
            font-size: 2rem;
            margin-top: -16px;
            font-weight: 800;
        }

        .progress-wrap {
            margin-top: 24px;
        }

        .progress-meta {
            display: flex;
            justify-content: space-between;
            color: #b6c8b8;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 1rem;
        }

        .progress-track {
            width: 100%;
            height: 16px;
            border-radius: 999px;
            background: rgba(60, 84, 66, 0.45);
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #488f45 0%, #67c861 100%);
            border-radius: 999px;
            transition: width 1s ease;
            box-shadow: 0 0 12px rgba(98, 193, 95, 0.55);
        }

        .progress-text {
            margin-top: 8px;
            text-align: center;
            color: var(--accent);
            font-size: 1.2rem;
            font-weight: 700;
        }

        .notice {
            margin-top: 12px;
            text-align: center;
            color: #d4e1d5;
            font-size: 0.96rem;
        }

        .error {
            margin-top: 16px;
            border-radius: 12px;
            background: rgba(163, 42, 42, 0.2);
            border: 1px solid rgba(240, 116, 116, 0.38);
            color: #ffdcdc;
            padding: 12px;
            text-align: center;
            display: none;
        }

        @media (max-width: 880px) {
            .cards {
                grid-template-columns: 1fr;
            }

            .card {
                padding: 20px;
            }

            .progress-meta {
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <section class="dashboard">
        <header class="top">
            <h1 class="title">🌙 Today Sehri & Iftar Time Dhaka</h1>
            <p class="subtitle" id="metaLine">Loading Dhaka, Bangladesh timing data...</p>
        </header>

        <div class="cards">
            <article class="card">
                <div class="label">☀️ Dhaka Sehri Time Today</div>
                <div class="time" id="sehriTime">--:--</div>
            </article>

            <article class="card">
                <div class="label">🌙 Dhaka Iftar Time Today</div>
                <div class="time" id="iftarTime">--:--</div>
            </article>
        </div>

        <article class="card countdown-card">
            <h2 class="countdown-title">⏳ Iftar Remaining Time</h2>

            <div class="countdown">
                <div class="time-chunk">
                    <div class="digits" id="hours">00</div>
                    <div class="chunk-label">Hours</div>
                </div>
                <div class="colon">:</div>
                <div class="time-chunk">
                    <div class="digits" id="minutes">00</div>
                    <div class="chunk-label">Minutes</div>
                </div>
                <div class="colon">:</div>
                <div class="time-chunk">
                    <div class="digits" id="seconds">00</div>
                    <div class="chunk-label">Seconds</div>
                </div>
            </div>

            <div class="progress-wrap">
                <div class="progress-meta">
                    <span id="sehriMarker">Sehri: --:--</span>
                    <span id="iftarMarker">Iftar: --:--</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">0% fasting completed</div>
                <p class="notice" id="statusNotice">Countdown will start after loading timings.</p>
            </div>

            <div class="error" id="errorBox"></div>
        </article>
    </section>

    <script>
        const city = 'Dhaka';
        const country = 'Bangladesh';
        const method = 1;

        const sehriTimeEl = document.getElementById('sehriTime');
        const iftarTimeEl = document.getElementById('iftarTime');
        const metaLineEl = document.getElementById('metaLine');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const progressFillEl = document.getElementById('progressFill');
        const progressTextEl = document.getElementById('progressText');
        const statusNoticeEl = document.getElementById('statusNotice');
        const sehriMarkerEl = document.getElementById('sehriMarker');
        const iftarMarkerEl = document.getElementById('iftarMarker');
        const errorBoxEl = document.getElementById('errorBox');

        let sehriDate = null;
        let iftarDate = null;

        function showError(message) {
            errorBoxEl.style.display = 'block';
            errorBoxEl.textContent = message;
        }

        function pad(value) {
            return String(value).padStart(2, '0');
        }

        function sanitizeTime(rawTime) {
            // Aladhan sometimes returns time with timezone suffix, e.g. "05:01 (+06)"
            return rawTime.split(' ')[0].trim();
        }

        function parseDhakaTime(timeString) {
            const clean = sanitizeTime(timeString);
            const parts = clean.split(':');
            if (parts.length < 2) {
                return null;
            }

            const now = new Date();
            const base = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
            base.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
            return base;
        }

        function updateCountdownAndProgress() {
            if (!sehriDate || !iftarDate) {
                return;
            }

            const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
            const msRemaining = iftarDate - now;
            const totalFastingMs = iftarDate - sehriDate;
            const elapsedMs = now - sehriDate;

            if (msRemaining <= 0) {
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                progressFillEl.style.width = '100%';
                progressTextEl.textContent = '100% fasting completed';
                statusNoticeEl.textContent = 'Iftar time has started. May Allah accept your fasting.';
                return;
            }

            const hrs = Math.floor(msRemaining / (1000 * 60 * 60));
            const mins = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((msRemaining % (1000 * 60)) / 1000);

            hoursEl.textContent = pad(hrs);
            minutesEl.textContent = pad(mins);
            secondsEl.textContent = pad(secs);

            let percent = 0;
            if (now <= sehriDate) {
                percent = 0;
                statusNoticeEl.textContent = 'Sehri has not ended yet. Fasting period will start soon.';
            } else {
                percent = Math.min(100, Math.max(0, (elapsedMs / totalFastingMs) * 100));
                statusNoticeEl.textContent = 'Fasting day is in progress.';
            }

            progressFillEl.style.width = percent.toFixed(2) + '%';
            progressTextEl.textContent = Math.floor(percent) + '% fasting completed';
        }

        async function loadRamadanTiming() {
            try {
                const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Failed to fetch timings from API.');
                }

                const result = await response.json();
                const data = result?.data;
                const timings = data?.timings;
                const dateInfo = data?.date;

                if (!timings?.Fajr || !timings?.Maghrib) {
                    throw new Error('Incomplete timing data received from API.');
                }

                const fajr = sanitizeTime(timings.Fajr);
                const maghrib = sanitizeTime(timings.Maghrib);

                sehriDate = parseDhakaTime(fajr);
                iftarDate = parseDhakaTime(maghrib);

                if (!sehriDate || !iftarDate) {
                    throw new Error('Could not parse prayer times.');
                }

                sehriTimeEl.textContent = fajr;
                iftarTimeEl.textContent = maghrib;
                sehriMarkerEl.textContent = `Sehri: ${fajr}`;
                iftarMarkerEl.textContent = `Iftar: ${maghrib}`;

                const readableDate = dateInfo?.readable || new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' });
                const hijriDate = dateInfo?.hijri?.date ? `${dateInfo.hijri.date} Ramadan, ${dateInfo.hijri.year}` : 'Hijri date unavailable';
                metaLineEl.textContent = `DHAKA, BANGLADESH | ${readableDate} | ${hijriDate}`;

                updateCountdownAndProgress();
                setInterval(updateCountdownAndProgress, 1000);
            } catch (error) {
                showError(error.message || 'Something went wrong while loading timings.');
                metaLineEl.textContent = 'Unable to load Ramadan timing data right now.';
                statusNoticeEl.textContent = 'Please refresh later or check your network connection.';
            }
        }

        loadRamadanTiming();
    </script>
</body>
</html>
