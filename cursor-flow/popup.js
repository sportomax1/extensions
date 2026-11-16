(() => {
  "use strict";

  const KEY = "cursorFlow";
  const DEFAULTS = {
    enabled: true,
    theme: "sunset",
    effect: "both",
    glyphs: true,
    follow: "off",
    intensity: 60
  };
  const controls = [...document.querySelectorAll("[data-key]")];
  const intensityValue = document.getElementById("intensityValue");
  const status = document.getElementById("status");
  let state = { ...DEFAULTS };

  function render() {
    for (const control of controls) {
      const value = state[control.dataset.key];
      if (control.type === "checkbox") control.checked = Boolean(value);
      else control.value = String(value);
    }
    intensityValue.textContent = state.intensity + "%";
    document.body.classList.toggle("is-off", !state.enabled);
  }

  function save() {
    chrome.storage.sync.set({ [KEY]: state }, () => {
      status.textContent = chrome.runtime.lastError ? "Could not save settings" : "Saved";
    });
  }

  for (const control of controls) {
    control.addEventListener(control.type === "range" ? "input" : "change", () => {
      const key = control.dataset.key;
      const value = control.type === "checkbox" ? control.checked
        : control.type === "range" ? Number(control.value) : control.value;
      state = { ...state, [key]: value };
      render();
      save();
    });
  }

  chrome.storage.sync.get({ [KEY]: DEFAULTS }, (result) => {
    if (chrome.runtime.lastError) {
      status.textContent = "Could not load settings";
      return;
    }
    state = { ...DEFAULTS, ...(result[KEY] || {}) };
    render();
  });
})();
