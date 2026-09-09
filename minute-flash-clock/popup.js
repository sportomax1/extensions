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

const ids = Object.keys(DEFAULTS);
const status = document.getElementById("status");

function showStatus(message) {
  status.textContent = message;
  setTimeout(() => {
    if (status.textContent === message) status.textContent = "";
  }, 1400);
}

chrome.storage.sync.get(DEFAULTS, (values) => {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = Boolean(values[id]);
    else el.value = String(values[id]);
  }
});

for (const id of ids) {
  const el = document.getElementById(id);
  if (!el) continue;

  el.addEventListener("change", () => {
    let value;
    if (el.type === "checkbox") value = el.checked;
    else if (id === "durationMs") value = Number(el.value);
    else value = el.value;

    chrome.storage.sync.set({ [id]: value }, () => showStatus("Saved"));
  });
}

document.getElementById("test").addEventListener("click", () => {
  const testTier = document.getElementById("testTier").value;
  chrome.storage.local.set(
    {
      testTier,
      testFlashNonce: Date.now()
    },
    () => showStatus(testTier === "auto" ? "Current tier flashed" : `${testTier} tier flashed`)
  );
});
