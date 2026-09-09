const DEFAULTS = {
  language: "en-US",
  continuous: true,
  appendSpace: true,
  voiceCommands: true,
  showIndicator: true
};

const els = {
  status: document.getElementById("status"),
  statusText: document.getElementById("statusText"),
  toggle: document.getElementById("toggle"),
  error: document.getElementById("error"),
  language: document.getElementById("language"),
  continuous: document.getElementById("continuous"),
  appendSpace: document.getElementById("appendSpace"),
  voiceCommands: document.getElementById("voiceCommands"),
  showIndicator: document.getElementById("showIndicator"),
  shortcut: document.getElementById("shortcut")
};

let activeTabId = null;
let pageState = { active: false, supported: true, hasTarget: false };

function setError(message = "") {
  els.error.textContent = message;
}

function renderStatus() {
  const active = Boolean(pageState.active);
  els.status.classList.toggle("on", active);
  els.toggle.classList.toggle("stop", active);
  els.toggle.textContent = active ? "Stop Dictation" : "Start Dictation";

  if (!pageState.supported) {
    els.statusText.textContent = "Speech recognition is not supported here";
    els.toggle.disabled = true;
  } else if (active) {
    els.statusText.textContent = "Listening — speak now";
    els.toggle.disabled = false;
  } else if (pageState.hasTarget) {
    els.statusText.textContent = "Ready — text field remembered";
    els.toggle.disabled = false;
  } else {
    els.statusText.textContent = "Ready — click a text field on the page first";
    els.toggle.disabled = false;
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

async function sendToPage(message) {
  if (!activeTabId) throw new Error("No active browser tab found.");
  return chrome.tabs.sendMessage(activeTabId, message);
}

async function refreshPageState() {
  setError("");
  const tab = await getActiveTab();
  activeTabId = tab?.id || null;

  if (!activeTabId) {
    setError("No active browser tab found.");
    els.toggle.disabled = true;
    return;
  }

  try {
    const response = await sendToPage({ type: "GET_DICTATION_STATUS" });
    pageState = {
      active: Boolean(response?.active),
      supported: response?.supported !== false,
      hasTarget: Boolean(response?.hasTarget)
    };
    renderStatus();
  } catch {
    pageState = { active: false, supported: false, hasTarget: false };
    renderStatus();
    setError("Browser Dictation cannot run on this page. Chrome blocks extensions on pages such as chrome://, the Chrome Web Store, and some built-in browser screens.");
  }
}

async function loadSettings() {
  const saved = await chrome.storage.sync.get(DEFAULTS);
  els.language.value = saved.language || DEFAULTS.language;
  els.continuous.checked = Boolean(saved.continuous);
  els.appendSpace.checked = Boolean(saved.appendSpace);
  els.voiceCommands.checked = Boolean(saved.voiceCommands);
  els.showIndicator.checked = Boolean(saved.showIndicator);
}

async function saveSettings() {
  const next = {
    language: els.language.value,
    continuous: els.continuous.checked,
    appendSpace: els.appendSpace.checked,
    voiceCommands: els.voiceCommands.checked,
    showIndicator: els.showIndicator.checked
  };

  await chrome.storage.sync.set(next);
  try {
    await sendToPage({ type: "SETTINGS_CHANGED" });
  } catch {}
}

els.toggle.addEventListener("click", async () => {
  setError("");

  if (!pageState.active && !pageState.hasTarget) {
    setError("Click inside the text box where you want to type, then use the keyboard shortcut or reopen this popup.");
    return;
  }

  try {
    await sendToPage({ type: "TOGGLE_DICTATION" });
    await new Promise(resolve => setTimeout(resolve, 120));
    await refreshPageState();

    if (pageState.active) {
      window.setTimeout(() => window.close(), 180);
    }
  } catch {
    setError("Could not start dictation on this page. Refresh the page after installing or reloading the extension, then try again.");
  }
});

[els.language, els.continuous, els.appendSpace, els.voiceCommands, els.showIndicator]
  .forEach(element => element.addEventListener("change", saveSettings));

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "DICTATION_STATE") return;
  pageState.active = Boolean(message.active);
  if (typeof message.supported === "boolean") pageState.supported = message.supported;
  renderStatus();
});

chrome.commands.getAll().then(commands => {
  const toggle = commands.find(command => command.name === "toggle-dictation");
  if (!toggle?.shortcut) return;
  const pieces = toggle.shortcut.split("+");
  els.shortcut.textContent = pieces[0] || "Alt";
}).catch(() => {});

Promise.all([loadSettings(), refreshPageState()]).catch(error => {
  setError(error?.message || "Browser Dictation could not initialize.");
});
