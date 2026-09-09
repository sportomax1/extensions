(() => {
  if (window.__browserDictationLoaded) return;
  window.__browserDictationLoaded = true;

  const DEFAULTS = {
    language: "en-US",
    continuous: true,
    appendSpace: true,
    voiceCommands: true,
    showIndicator: true
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  let settings = { ...DEFAULTS };
  let recognition = null;
  let active = false;
  let fatalError = false;
  let lastEditable = null;
  let lastInputSelection = null;
  let savedContentRange = null;
  let restartTimer = null;
  let indicatorHost = null;
  let indicatorStatus = null;
  let indicatorText = null;

  function isEditable(element) {
    if (!(element instanceof Element)) return false;
    if (element instanceof HTMLTextAreaElement) return !element.disabled && !element.readOnly;
    if (element instanceof HTMLInputElement) {
      const allowed = new Set(["text", "search", "email", "url", "tel", "password"]);
      return allowed.has((element.type || "text").toLowerCase()) && !element.disabled && !element.readOnly;
    }
    return element.isContentEditable;
  }

  function nearestEditable(node) {
    if (!(node instanceof Element)) return null;
    if (isEditable(node)) return node;
    const editable = node.closest?.("textarea, input, [contenteditable='true'], [contenteditable='']");
    return editable && isEditable(editable) ? editable : null;
  }

  function rememberEditable(element) {
    if (!isEditable(element)) return;
    lastEditable = element;

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      lastInputSelection = {
        start: Number.isInteger(element.selectionStart) ? element.selectionStart : element.value.length,
        end: Number.isInteger(element.selectionEnd) ? element.selectionEnd : element.value.length
      };
    }
  }

  document.addEventListener("focusin", (event) => {
    const editable = nearestEditable(event.target);
    if (editable) rememberEditable(editable);
  }, true);

  document.addEventListener("selectionchange", () => {
    const focused = nearestEditable(document.activeElement);
    if (focused) rememberEditable(focused);

    if (lastEditable?.isContentEditable) {
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        if (lastEditable.contains(range.commonAncestorContainer)) {
          savedContentRange = range.cloneRange();
        }
      }
    }
  }, true);

  document.addEventListener("keyup", () => {
    const focused = nearestEditable(document.activeElement);
    if (focused) rememberEditable(focused);
  }, true);

  document.addEventListener("mouseup", () => {
    const focused = nearestEditable(document.activeElement);
    if (focused) rememberEditable(focused);
  }, true);

  function currentTarget() {
    const focused = nearestEditable(document.activeElement);
    if (focused) {
      rememberEditable(focused);
      return focused;
    }
    if (lastEditable?.isConnected && isEditable(lastEditable)) return lastEditable;
    return null;
  }

  function ensureIndicator() {
    if (indicatorHost?.isConnected) return;

    indicatorHost = document.createElement("div");
    indicatorHost.id = "browser-dictation-indicator-host";
    indicatorHost.style.cssText = [
      "all:initial",
      "position:fixed",
      "right:18px",
      "bottom:18px",
      "z-index:2147483647",
      "pointer-events:none"
    ].join(";");

    const shadow = indicatorHost.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .pill {
          display:flex;
          align-items:center;
          gap:9px;
          min-width:150px;
          max-width:min(360px, calc(100vw - 36px));
          padding:10px 13px;
          border:1px solid rgba(255,255,255,.16);
          border-radius:999px;
          background:rgba(17,24,39,.94);
          color:#fff;
          box-shadow:0 10px 34px rgba(0,0,0,.3);
          backdrop-filter:blur(14px);
          font:600 13px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
          opacity:0;
          transform:translateY(8px) scale(.98);
          transition:opacity .16s ease, transform .16s ease;
        }
        .pill.visible { opacity:1; transform:translateY(0) scale(1); }
        .dot {
          width:10px;
          height:10px;
          flex:0 0 auto;
          border-radius:50%;
          background:#ef4444;
          box-shadow:0 0 0 0 rgba(239,68,68,.45);
        }
        .listening .dot { animation:pulse 1.2s infinite; }
        .error .dot { background:#f59e0b; }
        .idle .dot { background:#94a3b8; }
        .copy { min-width:0; }
        .status { display:block; white-space:nowrap; }
        .text {
          display:block;
          margin-top:2px;
          max-width:290px;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:#cbd5e1;
          font-size:11px;
          font-weight:500;
        }
        @keyframes pulse {
          0% { box-shadow:0 0 0 0 rgba(239,68,68,.48); }
          70% { box-shadow:0 0 0 9px rgba(239,68,68,0); }
          100% { box-shadow:0 0 0 0 rgba(239,68,68,0); }
        }
      </style>
      <div class="pill idle" role="status" aria-live="polite">
        <span class="dot"></span>
        <span class="copy">
          <span class="status">Browser Dictation</span>
          <span class="text"></span>
        </span>
      </div>
    `;

    indicatorStatus = shadow.querySelector(".status");
    indicatorText = shadow.querySelector(".text");
    document.documentElement.appendChild(indicatorHost);
  }

  function showIndicator(mode, title, detail = "") {
    if (!settings.showIndicator) return;
    ensureIndicator();
    const pill = indicatorHost.shadowRoot.querySelector(".pill");
    pill.className = `pill visible ${mode}`;
    indicatorStatus.textContent = title;
    indicatorText.textContent = detail;
    indicatorText.style.display = detail ? "block" : "none";
  }

  function hideIndicator(delay = 350) {
    if (!indicatorHost?.isConnected) return;
    window.setTimeout(() => {
      if (active) return;
      indicatorHost?.shadowRoot?.querySelector(".pill")?.classList.remove("visible");
    }, delay);
  }

  async function loadSettings() {
    try {
      const stored = await chrome.storage.sync.get(DEFAULTS);
      settings = { ...DEFAULTS, ...stored };
    } catch {
      settings = { ...DEFAULTS };
    }
  }

  function notifyState(extra = {}) {
    chrome.runtime.sendMessage({
      type: "DICTATION_STATE",
      active,
      supported: Boolean(SpeechRecognition),
      ...extra
    }).catch(() => {});
  }

  function normalizeVoiceCommand(raw) {
    const trimmed = raw.trim();
    if (!settings.voiceCommands) return { type: "text", text: trimmed };

    const command = trimmed.toLowerCase().replace(/[.!?]+$/g, "");
    const commands = {
      "new line": "\n",
      "newline": "\n",
      "new paragraph": "\n\n",
      "comma": ", ",
      "period": ". ",
      "full stop": ". ",
      "question mark": "? ",
      "exclamation mark": "! ",
      "exclamation point": "! ",
      "colon": ": ",
      "semicolon": "; "
    };

    if (Object.prototype.hasOwnProperty.call(commands, command)) {
      return { type: "text", text: commands[command], command: true };
    }

    return { type: "text", text: trimmed };
  }

  function prepareTextForInput(element, rawText, isCommand) {
    let text = rawText;
    if (!text) return text;

    if (isCommand || /^\s|^[,.;:!?]/.test(text)) return text;

    const value = element.value || "";
    const caret = Number.isInteger(element.selectionStart) ? element.selectionStart : value.length;
    const previous = value.slice(0, caret).slice(-1);
    if (previous && !/\s/.test(previous)) text = ` ${text}`;
    if (settings.appendSpace && !/[\s\n]$/.test(text)) text += " ";
    return text;
  }

  function insertIntoInput(element, rawText, isCommand) {
    element.focus({ preventScroll: true });

    const value = element.value || "";
    let start = lastInputSelection?.start;
    let end = lastInputSelection?.end;

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      start = Number.isInteger(element.selectionStart) ? element.selectionStart : value.length;
      end = Number.isInteger(element.selectionEnd) ? element.selectionEnd : start;
    }

    start = Math.max(0, Math.min(start, value.length));
    end = Math.max(start, Math.min(end, value.length));

    let text = prepareTextForInput(element, rawText, isCommand);
    if (!text) return;

    try {
      element.setSelectionRange(start, end);
      element.setRangeText(text, start, end, "end");
    } catch {
      const next = value.slice(0, start) + text + value.slice(end);
      element.value = next;
      const caret = start + text.length;
      try { element.setSelectionRange(caret, caret); } catch {}
    }

    const caret = start + text.length;
    lastInputSelection = { start: caret, end: caret };

    try {
      element.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        composed: true,
        inputType: "insertText",
        data: text
      }));
    } catch {
      element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    }
  }

  function insertIntoContentEditable(element, rawText, isCommand) {
    let text = rawText;
    if (!text) return;

    if (!isCommand && settings.appendSpace && !/[\s\n]$/.test(text)) text += " ";

    element.focus({ preventScroll: true });
    const selection = window.getSelection();

    if (savedContentRange && element.contains(savedContentRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedContentRange);
    } else if (!selection.rangeCount || !element.contains(selection.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    let inserted = false;
    try {
      inserted = document.execCommand("insertText", false, text);
    } catch {}

    if (!inserted) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(text);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      try {
        element.dispatchEvent(new InputEvent("input", {
          bubbles: true,
          composed: true,
          inputType: "insertText",
          data: text
        }));
      } catch {
        element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      }
    }

    if (selection.rangeCount) savedContentRange = selection.getRangeAt(0).cloneRange();
  }

  function insertTranscript(raw) {
    const target = currentTarget();
    if (!target) {
      showIndicator("error", "No text field selected", "Click a text box, then toggle dictation again.");
      return false;
    }

    const normalized = normalizeVoiceCommand(raw);
    if (!normalized.text) return true;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      insertIntoInput(target, normalized.text, Boolean(normalized.command));
    } else {
      insertIntoContentEditable(target, normalized.text, Boolean(normalized.command));
    }

    rememberEditable(target);
    return true;
  }

  function buildRecognition() {
    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.lang = settings.language || navigator.language || "en-US";
    instance.continuous = Boolean(settings.continuous);
    instance.interimResults = true;
    instance.maxAlternatives = 1;

    instance.onstart = () => {
      fatalError = false;
      showIndicator("listening", "Listening…", "Speak normally. Your words will be inserted at the caret.");
      notifyState();
    };

    instance.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i]?.[0]?.transcript || "";
        if (event.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }

      if (interimText) showIndicator("listening", "Listening…", interimText.trim());
      if (finalText.trim()) {
        insertTranscript(finalText);
        showIndicator("listening", "Listening…", finalText.trim());
      }
    };

    instance.onerror = (event) => {
      const code = event.error || "unknown";
      const fatal = ["not-allowed", "service-not-allowed", "audio-capture"].includes(code);

      if (fatal) {
        fatalError = true;
        active = false;
        showIndicator("error", "Microphone unavailable", code === "audio-capture"
          ? "Chrome could not access a microphone."
          : "Allow microphone/speech access, then try again.");
        notifyState({ error: code });
        hideIndicator(3500);
      } else if (active && code !== "aborted") {
        showIndicator("error", "Dictation interrupted", code);
      }
    };

    instance.onend = () => {
      recognition = null;

      if (active && settings.continuous && !fatalError) {
        clearTimeout(restartTimer);
        restartTimer = window.setTimeout(() => {
          if (active) startRecognition(true);
        }, 250);
        return;
      }

      if (active && !settings.continuous) active = false;
      notifyState();
      if (!active) {
        showIndicator("idle", "Dictation stopped");
        hideIndicator(700);
      }
    };

    return instance;
  }

  async function startRecognition(isRestart = false) {
    if (recognition) return;
    await loadSettings();

    if (!SpeechRecognition) {
      active = false;
      showIndicator("error", "Speech recognition unsupported", "Use Google Chrome or a Chromium browser that supports Web Speech.");
      notifyState({ error: "unsupported" });
      hideIndicator(3500);
      return;
    }

    if (!currentTarget()) {
      active = false;
      showIndicator("error", "No text field selected", "Click where you want the dictated text first.");
      notifyState({ error: "no-target" });
      hideIndicator(3000);
      return;
    }

    active = true;
    fatalError = false;
    recognition = buildRecognition();

    try {
      recognition.start();
    } catch (error) {
      recognition = null;
      if (!isRestart) {
        active = false;
        showIndicator("error", "Could not start dictation", error?.message || "Try again.");
        notifyState({ error: "start-failed" });
        hideIndicator(3000);
      }
    }
  }

  function stopRecognition() {
    active = false;
    fatalError = false;
    clearTimeout(restartTimer);
    restartTimer = null;

    const current = recognition;
    recognition = null;
    try { current?.stop(); } catch {}

    notifyState();
    showIndicator("idle", "Dictation stopped");
    hideIndicator(650);
  }

  function toggleRecognition() {
    if (active) stopRecognition();
    else startRecognition();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "TOGGLE_DICTATION") {
      toggleRecognition();
      sendResponse({ ok: true, active: !active ? false : true });
      return false;
    }

    if (message?.type === "START_DICTATION") {
      startRecognition();
      sendResponse({ ok: true });
      return false;
    }

    if (message?.type === "STOP_DICTATION") {
      stopRecognition();
      sendResponse({ ok: true });
      return false;
    }

    if (message?.type === "GET_DICTATION_STATUS") {
      sendResponse({
        ok: true,
        active,
        supported: Boolean(SpeechRecognition),
        hasTarget: Boolean(currentTarget())
      });
      return false;
    }

    if (message?.type === "SETTINGS_CHANGED") {
      loadSettings().then(() => {
        if (active && recognition) {
          stopRecognition();
          window.setTimeout(() => startRecognition(), 100);
        }
      });
      sendResponse({ ok: true });
      return false;
    }

    return false;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, change] of Object.entries(changes)) {
      if (key in DEFAULTS) settings[key] = change.newValue;
    }
  });

  loadSettings();
})();
