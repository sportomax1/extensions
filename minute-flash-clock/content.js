(() => {
  if (window.__minuteFlashClockLoaded) return;
  window.__minuteFlashClockLoaded = true;

  const DEFAULTS = {
    enabled: true,
    durationMs: 1800,
    timeFormat: "12h",
    animation: "zoom",
    showSeconds: false,
    dimPage: true,
    sound: false,
    tierNormal: true,
    tierFive: true,
    tierQuarter: true,
    tierHalf: true,
    tierHour: true
  };

  const TIER_META = {
    normal: {
      label: "New minute",
      setting: "tierNormal",
      durationMultiplier: 0.5,
      tone: [620]
    },
    five: {
      label: "5-minute mark",
      setting: "tierFive",
      durationMultiplier: 0.7,
      tone: [700]
    },
    quarter: {
      label: "Quarter hour",
      setting: "tierQuarter",
      durationMultiplier: 1.0,
      tone: [760, 920]
    },
    half: {
      label: "Half hour",
      setting: "tierHalf",
      durationMultiplier: 1.2,
      tone: [720, 920]
    },
    hour: {
      label: "New hour",
      setting: "tierHour",
      durationMultiplier: 1.5,
      tone: [660, 840, 1040]
    }
  };

  let settings = { ...DEFAULTS };
  let timeoutId = null;
  let minuteTimer = null;
  let lastMinuteKey = null;
  let audioContext = null;

  const HOST_ID = "minute-flash-clock-host";

  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULTS, (items) => {
        settings = { ...DEFAULTS, ...items };
        resolve(settings);
      });
    });
  }

  function formatTime(date) {
    const is24 = settings.timeFormat === "24h";
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !is24
    };

    if (settings.showSeconds) options.second = "2-digit";

    let value = new Intl.DateTimeFormat(undefined, options).format(date);
    return value.replace(/^0(?=\d:)/, "");
  }

  function minuteKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  }

  function classifyMinute(minute) {
    if (minute === 0) return "hour";
    if (minute === 30) return "half";
    if (minute === 15 || minute === 45) return "quarter";
    if (minute % 5 === 0) return "five";
    return "normal";
  }

  function isTierEnabled(tier) {
    const meta = TIER_META[tier] || TIER_META.normal;
    return settings[meta.setting] !== false;
  }

  function getOrCreateHost() {
    let host = document.getElementById(HOST_ID);
    if (host) return host;

    host = document.createElement("div");
    host.id = HOST_ID;
    host.style.all = "initial";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "none";
    host.style.display = "none";

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .stage {
          --accent: 255,255,255;
          --backdrop-opacity: .26;
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,var(--backdrop-opacity));
          opacity: 0;
          animation: backdropIn .18s ease-out forwards;
        }
        .backdrop.off { display: none; }
        .clock-wrap {
          position: relative;
          display: grid;
          place-items: center;
          border-radius: 32px;
          background: rgba(10, 12, 18, .88);
          border: 1px solid rgba(var(--accent), .38);
          box-shadow:
            0 30px 100px rgba(0,0,0,.48),
            0 0 42px rgba(var(--accent), .12),
            inset 0 1px 0 rgba(255,255,255,.09);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          transform-origin: center;
          overflow: hidden;
        }
        .clock-wrap::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(110deg, transparent 15%, rgba(var(--accent), .22) 48%, transparent 75%);
          transform: translateX(-120%);
          animation: shine .85s ease-out .08s 1;
        }
        .clock-wrap::after {
          content: "";
          position: absolute;
          left: 12%;
          right: 12%;
          bottom: 0;
          height: 3px;
          border-radius: 999px 999px 0 0;
          background: rgba(var(--accent), .78);
          box-shadow: 0 0 22px rgba(var(--accent), .5);
        }
        .time {
          position: relative;
          font-weight: 800;
          line-height: .95;
          letter-spacing: -.06em;
          color: white;
          text-shadow: 0 6px 28px rgba(0,0,0,.42);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .sub {
          position: relative;
          color: rgba(255,255,255,.72);
          font-weight: 800;
          text-transform: uppercase;
        }
        .tier-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 12px;
          padding: 5px 9px;
          border: 1px solid rgba(var(--accent), .34);
          border-radius: 999px;
          background: rgba(var(--accent), .09);
          color: rgba(255,255,255,.78);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
        }
        .tier-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgb(var(--accent));
          box-shadow: 0 0 12px rgba(var(--accent), .75);
        }

        /* Strongest matching tier wins. Each tier intentionally increases prominence. */
        .stage.tier-normal { --accent: 210,218,232; --backdrop-opacity: .10; }
        .stage.tier-normal .clock-wrap { min-width: min(50vw, 430px); padding: 16px 28px 19px; border-radius: 24px; opacity: .86; }
        .stage.tier-normal .time { font-size: clamp(42px, 7vw, 82px); }
        .stage.tier-normal .sub { margin-top: 10px; font-size: 10px; letter-spacing: .18em; opacity: .7; }
        .stage.tier-normal .tier-badge { display: none; }

        .stage.tier-five { --accent: 103,202,255; --backdrop-opacity: .16; }
        .stage.tier-five .clock-wrap { min-width: min(58vw, 520px); padding: 20px 34px 23px; border-radius: 27px; }
        .stage.tier-five .time { font-size: clamp(50px, 8.5vw, 100px); }
        .stage.tier-five .sub { margin-top: 12px; font-size: 11px; letter-spacing: .19em; }
        .stage.tier-five .tier-badge { display: none; }

        .stage.tier-quarter { --accent: 159,127,255; --backdrop-opacity: .24; }
        .stage.tier-quarter .clock-wrap { min-width: min(68vw, 620px); padding: 24px 40px 27px; }
        .stage.tier-quarter .time { font-size: clamp(58px, 10vw, 122px); }
        .stage.tier-quarter .sub { margin-top: 14px; font-size: 12px; letter-spacing: .20em; }

        .stage.tier-half { --accent: 255,194,86; --backdrop-opacity: .31; }
        .stage.tier-half .clock-wrap {
          min-width: min(76vw, 700px);
          padding: 27px 44px 30px;
          box-shadow: 0 34px 110px rgba(0,0,0,.52), 0 0 58px rgba(var(--accent), .22), inset 0 1px 0 rgba(255,255,255,.11);
        }
        .stage.tier-half .time { font-size: clamp(66px, 11.5vw, 142px); }
        .stage.tier-half .sub { margin-top: 16px; font-size: 13px; letter-spacing: .21em; }

        .stage.tier-hour { --accent: 116,232,255; --backdrop-opacity: .40; }
        .stage.tier-hour .clock-wrap {
          min-width: min(84vw, 790px);
          padding: 31px 50px 35px;
          border-width: 2px;
          box-shadow: 0 38px 125px rgba(0,0,0,.58), 0 0 76px rgba(var(--accent), .32), inset 0 1px 0 rgba(255,255,255,.13);
        }
        .stage.tier-hour .clock-wrap::after { height: 5px; }
        .stage.tier-hour .time { font-size: clamp(76px, 13vw, 165px); }
        .stage.tier-hour .sub { margin-top: 18px; font-size: 14px; letter-spacing: .23em; color: rgba(255,255,255,.86); }
        .stage.tier-hour .tier-badge { padding: 6px 11px; font-size: 11px; }

        .zoom { animation: zoomIn .62s cubic-bezier(.16,1,.3,1) both; }
        .slide { animation: slideIn .68s cubic-bezier(.16,1,.3,1) both; }
        .flip { animation: flipIn .72s cubic-bezier(.16,1,.3,1) both; }
        .pulse { animation: pulseIn .75s cubic-bezier(.16,1,.3,1) both; }
        .fade-out { animation: fadeOut .32s ease-in forwards !important; }
        .backdrop.fade-out { animation: backdropOut .32s ease-in forwards !important; }

        @keyframes zoomIn {
          0% { opacity: 0; transform: scale(.56); filter: blur(14px); }
          58% { opacity: 1; transform: scale(1.06); filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateY(90px) scale(.92); filter: blur(10px); }
          70% { opacity: 1; transform: translateY(-8px) scale(1.015); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes flipIn {
          0% { opacity: 0; transform: perspective(900px) rotateX(-75deg) scale(.86); }
          65% { opacity: 1; transform: perspective(900px) rotateX(8deg) scale(1.02); }
          100% { opacity: 1; transform: perspective(900px) rotateX(0) scale(1); }
        }
        @keyframes pulseIn {
          0% { opacity: 0; transform: scale(.88); }
          35% { opacity: 1; transform: scale(1.09); }
          58% { transform: scale(.97); }
          78% { transform: scale(1.035); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: scale(.94); filter: blur(7px); }
        }
        @keyframes backdropIn { to { opacity: 1; } }
        @keyframes backdropOut { to { opacity: 0; } }
        @keyframes shine { to { transform: translateX(120%); } }

        @media (prefers-reduced-motion: reduce) {
          .zoom, .slide, .flip, .pulse { animation: none; }
          .clock-wrap { opacity: 1; transform: none; }
        }
      </style>
      <div class="stage tier-normal">
        <div class="backdrop"></div>
        <div class="clock-wrap zoom">
          <div class="tier-badge"><span class="tier-dot"></span><span class="tier-name">Minute</span></div>
          <div class="time"></div>
          <div class="sub">New minute</div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(host);
    return host;
  }

  function playTone(tier) {
    if (!settings.sound) return;

    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const frequencies = (TIER_META[tier] || TIER_META.normal).tone;
      const startAt = audioContext.currentTime;

      frequencies.forEach((frequency, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const noteStart = startAt + index * 0.09;
        const noteEnd = noteStart + 0.12;

        osc.type = tier === "hour" ? "triangle" : "sine";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.05, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(noteStart);
        osc.stop(noteEnd + 0.01);
      });
    } catch (_) {}
  }

  function showFlash(date = new Date(), forcedTier = null) {
    if (!settings.enabled) return;

    const tier = forcedTier && TIER_META[forcedTier] ? forcedTier : classifyMinute(date.getMinutes());
    if (!forcedTier && !isTierEnabled(tier)) return;

    const meta = TIER_META[tier];
    const host = getOrCreateHost();
    const shadow = host.shadowRoot;
    const stage = shadow.querySelector(".stage");
    const clock = shadow.querySelector(".clock-wrap");
    const backdrop = shadow.querySelector(".backdrop");
    const time = shadow.querySelector(".time");
    const sub = shadow.querySelector(".sub");
    const tierName = shadow.querySelector(".tier-name");

    clearTimeout(timeoutId);
    host.style.display = "block";
    stage.className = `stage tier-${tier}`;
    time.textContent = formatTime(date);
    sub.textContent = meta.label;
    tierName.textContent = meta.label;
    backdrop.className = settings.dimPage ? "backdrop" : "backdrop off";
    clock.className = `clock-wrap ${settings.animation}`;

    // Force animation restart even when test flashes happen close together.
    void clock.offsetWidth;
    clock.className = `clock-wrap ${settings.animation}`;

    playTone(tier);

    const baseDuration = Math.max(450, Number(settings.durationMs) || DEFAULTS.durationMs);
    const visibleFor = Math.max(450, Math.round(baseDuration * meta.durationMultiplier));

    timeoutId = setTimeout(() => {
      clock.classList.add("fade-out");
      if (settings.dimPage) backdrop.classList.add("fade-out");

      setTimeout(() => {
        host.style.display = "none";
        clock.classList.remove("fade-out");
        backdrop.classList.remove("fade-out");
      }, 340);
    }, visibleFor);
  }

  function scheduleNextMinute() {
    clearTimeout(minuteTimer);

    const now = new Date();
    const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    minuteTimer = setTimeout(() => {
      const current = new Date();
      const key = minuteKey(current);

      if (key !== lastMinuteKey) {
        lastMinuteKey = key;
        showFlash(current);
      }

      // Recalculate each minute instead of setInterval to reduce timer drift.
      scheduleNextMinute();
    }, Math.max(20, msUntilNextMinute));
  }

  function makeTestDate(tier) {
    const date = new Date();
    const sampleMinutes = {
      normal: 1,
      five: 5,
      quarter: 15,
      half: 30,
      hour: 0
    };

    if (tier && Object.prototype.hasOwnProperty.call(sampleMinutes, tier)) {
      date.setMinutes(sampleMinutes[tier], 0, 0);
    }

    return date;
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") {
      for (const [key, change] of Object.entries(changes)) {
        settings[key] = change.newValue;
      }
      scheduleNextMinute();
      return;
    }

    if (area === "local" && changes.testFlashNonce?.newValue) {
      chrome.storage.local.get({ testTier: "auto" }, ({ testTier }) => {
        const forcedTier = testTier === "auto" ? null : testTier;
        const testDate = forcedTier ? makeTestDate(forcedTier) : new Date();
        showFlash(testDate, forcedTier);
      });
    }
  });

  // Re-sync after a sleeping/backgrounded tab becomes active again.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleNextMinute();
  });

  window.addEventListener("focus", scheduleNextMinute);

  loadSettings().then(scheduleNextMinute);
})();
