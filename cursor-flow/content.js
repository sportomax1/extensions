/* Cursor Flow: purely visual typing effects. No network calls or text persistence. */
(() => {
  "use strict";

  if (window.__cursorFlowInjected) return;
  window.__cursorFlowInjected = true;

  const KEY = "cursorFlow";
  const DEFAULTS = {
    enabled: true,
    theme: "sunset",
    effect: "both",
    glyphs: true,
    follow: "off",
    intensity: 60
  };
  const THEMES = {
    sunset: { rgb: "224,145,93", solid: "#ca8150" },
    ocean: { rgb: "88,149,180", solid: "#4f94b8" },
    lilac: { rgb: "158,128,192", solid: "#9275b8" },
    neutral: { rgb: "126,132,141", solid: "#858b95" }
  };
  const sensitivePattern = /password|passcode|passwd|one.?time|otp|verification.?code|security.?code|secret|pin.?code|social.?security|ssn|credit.?card|card.?number|cvc|cvv|routing.?number|bank.?account|auth.?token/i;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let settings = { ...DEFAULTS };
  let host = null;
  let shadow = null;
  let halo = null;
  let line = null;
  let focused = null;
  let lastPoint = null;
  let frame = 0;
  let composing = false;
  let lastFollow = 0;

  function applySettings(next) {
    const validTheme = Object.hasOwn(THEMES, next.theme) ? next.theme : DEFAULTS.theme;
    const validEffect = ["glow", "line", "both"].includes(next.effect) ? next.effect : DEFAULTS.effect;
    const validFollow = ["off", "edge", "center"].includes(next.follow) ? next.follow : DEFAULTS.follow;
    settings = {
      enabled: next.enabled !== false,
      theme: validTheme,
      effect: validEffect,
      glyphs: next.glyphs !== false,
      follow: validFollow,
      intensity: Math.max(10, Math.min(100, Number(next.intensity) || DEFAULTS.intensity))
    };
    if (host) {
      host.style.setProperty("--cf-rgb", THEMES[settings.theme].rgb);
      host.style.setProperty("--cf-solid", THEMES[settings.theme].solid);
      host.style.setProperty("--cf-opacity", String(settings.intensity / 100));
      host.dataset.effect = settings.effect;
    }
    requestUpdate();
  }

  function isSensitive(el) {
    if (el instanceof HTMLInputElement && el.type === "password") return true;
    const hint = [el.name, el.id, el.getAttribute("autocomplete"), el.getAttribute("aria-label")]
      .filter(Boolean).join(" ");
    return sensitivePattern.test(hint);
  }

  function editableFrom(node) {
    if (!node) return null;
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el || typeof el.closest !== "function") return null;
    const candidate = el.closest("input, textarea, [contenteditable]");
    if (!candidate || isSensitive(candidate)) return null;

    if (candidate instanceof HTMLTextAreaElement) {
      return !candidate.disabled && !candidate.readOnly ? candidate : null;
    }
    if (candidate instanceof HTMLInputElement) {
      return !candidate.disabled && !candidate.readOnly &&
        ["text", "search", "url", "tel", "email"].includes(candidate.type) ? candidate : null;
    }
    return candidate.isContentEditable ? candidate : null;
  }

  function activeEditable() {
    let node = document.activeElement;
    while (node && node.shadowRoot && node.shadowRoot.activeElement) {
      node = node.shadowRoot.activeElement;
    }
    return editableFrom(node);
  }

  function ensureOverlay() {
    if (host) return;
    host = document.createElement("div");
    host.setAttribute("data-cursor-flow", "");
    host.style.cssText = "position:fixed;inset:0;width:0;height:0;z-index:2147483646;pointer-events:none;contain:layout style;overflow:visible;";
    shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = [
      ":host{all:initial;pointer-events:none!important;}",
      ".cf-halo,.cf-line{position:fixed;left:0;top:0;pointer-events:none;will-change:transform,opacity;transition:left 110ms ease-out,top 110ms ease-out,opacity 160ms ease;}",
      ".cf-halo{width:80px;height:80px;border-radius:50%;transform:translate(-49%,-50%);background:radial-gradient(circle,rgba(var(--cf-rgb),.23) 0%,rgba(var(--cf-rgb),.105) 29%,rgba(var(--cf-rgb),0) 75%);filter:blur(4px);opacity:var(--cf-opacity);}",
      ".cf-line{width:210px;height:34px;transform:translate(-13%,-50%);background:linear-gradient(90deg,rgba(var(--cf-rgb),0),rgba(var(--cf-rgb),.12) 20%,rgba(var(--cf-rgb),.10) 60%,rgba(var(--cf-rgb),0));border-radius:30px;opacity:var(--cf-opacity);}",
      ".cf-halo[hidden],.cf-line[hidden]{display:none!important;}",
      ".cf-glyph{position:fixed;pointer-events:none;color:var(--cf-solid);font:600 17px/1.3 ui-sans-serif,system-ui,sans-serif;text-shadow:0 2px 16px rgba(var(--cf-rgb),.35);animation:cf-rise 650ms cubic-bezier(.15,.6,.2,1) forwards;white-space:pre;}",
      ".cf-pulse{position:fixed;width:12px;height:12px;border-radius:50%;border:1.5px solid var(--cf-solid);pointer-events:none;transform:translate(-50%,-50%);animation:cf-pulse 490ms ease-out forwards;}",
      "@keyframes cf-rise{0%{opacity:0;transform:translate(0,2px) scale(.8)}18%{opacity:.8}100%{opacity:0;transform:translate(9px,-24px) scale(1.16)}}",
      "@keyframes cf-pulse{0%{opacity:.55;scale:.35}100%{opacity:0;scale:2.4}}",
      "@media(prefers-reduced-motion:reduce){.cf-halo,.cf-line{transition:none}.cf-glyph,.cf-pulse{display:none}}"
    ].join("\n");
    halo = document.createElement("div");
    halo.className = "cf-halo";
    line = document.createElement("div");
    line.className = "cf-line";
    shadow.append(style, line, halo);
    (document.documentElement || document.body).append(host);
    applySettings(settings);
  }

  function mirrorCaret(el) {
    const pos = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const mirror = document.createElement("div");
    const properties = [
      "boxSizing", "fontFamily", "fontSize", "fontWeight", "fontStyle",
      "fontVariant", "fontStretch", "letterSpacing", "lineHeight", "textTransform",
      "textIndent", "textAlign", "paddingTop", "paddingRight", "paddingBottom",
      "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth",
      "borderLeftWidth", "tabSize", "wordSpacing", "direction"
    ];
    for (const prop of properties) mirror.style[prop] = cs[prop];
    mirror.style.cssText += "position:fixed;top:-10000px;left:0;visibility:hidden;pointer-events:none;overflow:hidden;border-style:solid;border-color:transparent;";
    mirror.style.width = rect.width + "px";
    mirror.style.height = "auto";
    mirror.style.whiteSpace = el instanceof HTMLTextAreaElement ? "pre-wrap" : "pre";
    mirror.style.overflowWrap = el instanceof HTMLTextAreaElement ? "break-word" : "normal";
    mirror.append(document.createTextNode(el.value.slice(0, pos)));
    const marker = document.createElement("span");
    marker.textContent = "\u200b";
    mirror.append(marker);
    (document.documentElement || document.body).append(mirror);

    const markerRect = marker.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    mirror.remove();

    const lineHeight = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) || 16) * 1.2;
    const x = rect.left + (markerRect.left - mirrorRect.left) - el.scrollLeft;
    const y = el instanceof HTMLInputElement
      ? rect.top + (rect.height - lineHeight) / 2
      : rect.top + (markerRect.top - mirrorRect.top) - el.scrollTop;

    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (x < rect.left - 3 || x > rect.right + 3 || y < rect.top - lineHeight || y > rect.bottom + 3) return null;
    return { x, y: y + lineHeight / 2, height: lineHeight };
  }

  function richCaret(el) {
    const sel = el.getRootNode().getSelection
      ? el.getRootNode().getSelection()
      : document.getSelection();
    if (!sel || !sel.rangeCount || !sel.anchorNode) return null;
    if (!el.contains(sel.anchorNode) && el !== sel.anchorNode) return null;

    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(false);
    const rects = range.getClientRects();
    let r = rects.length ? rects[0] : range.getBoundingClientRect();
    if (!r || (!r.height && !r.width)) {
      const node = sel.anchorNode.nodeType === Node.ELEMENT_NODE
        ? sel.anchorNode : sel.anchorNode.parentElement;
      if (!node) return null;
      r = node.getBoundingClientRect();
      if (!r.height) return null;
      return { x: r.left + 3, y: r.top + Math.min(r.height, 22) / 2, height: Math.min(r.height, 22) };
    }
    return { x: r.left, y: r.top + r.height / 2, height: r.height || 18 };
  }

  function getPoint(el) {
    try {
      const p = (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
        ? mirrorCaret(el) : richCaret(el);
      if (!p) return null;
      if (p.x < -5 || p.y < -5 || p.x > innerWidth + 5 || p.y > innerHeight + 5) return null;
      return p;
    } catch (_) {
      return null;
    }
  }

  function hide() {
    lastPoint = null;
    if (halo) halo.hidden = true;
    if (line) line.hidden = true;
  }

  function refresh() {
    if (!settings.enabled || document.visibilityState === "hidden") {
      hide();
      return;
    }
    const el = activeEditable();
    focused = el;
    if (!el) {
      hide();
      return;
    }
    const point = getPoint(el);
    if (!point) {
      hide();
      return;
    }
    ensureOverlay();
    lastPoint = point;
    const offset = Math.max(2, Math.min(8, point.height / 3));
    halo.hidden = settings.effect === "line";
    line.hidden = settings.effect === "glow";
    halo.style.left = point.x + "px";
    halo.style.top = point.y + "px";
    line.style.left = point.x + "px";
    line.style.top = (point.y + offset) + "px";
  }

  function requestUpdate() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      refresh();
    });
  }

  function burst(char) {
    if (!host || !lastPoint || reducedMotion.matches || !settings.enabled) return;
    const p = lastPoint;
    const pulse = document.createElement("span");
    pulse.className = "cf-pulse";
    pulse.style.left = p.x + "px";
    pulse.style.top = p.y + "px";
    shadow.append(pulse);
    pulse.addEventListener("animationend", () => pulse.remove(), { once: true });
    setTimeout(() => pulse.remove(), 1100);

    if (!settings.glyphs || !char || /^\s$/.test(char)) return;
    const glyph = document.createElement("span");
    glyph.className = "cf-glyph";
    glyph.textContent = char;
    glyph.style.left = (p.x + 5) + "px";
    glyph.style.top = (p.y - 15) + "px";
    glyph.style.opacity = String(settings.intensity / 100);
    shadow.append(glyph);
    glyph.addEventListener("animationend", () => glyph.remove(), { once: true });
    setTimeout(() => glyph.remove(), 1100);
  }

  function followCaret() {
    if (settings.follow === "off" || !lastPoint || reducedMotion.matches) return;
    if (performance.now() - lastFollow < 260) return;
    const y = lastPoint.y;
    const vh = innerHeight;
    const threshold = Math.max(60, Math.min(140, vh * .18));
    if (settings.follow === "edge" && y >= threshold && y <= vh - threshold) return;
    const targetY = settings.follow === "center" ? vh * .5 : (y < vh / 2 ? vh * .3 : vh * .7);
    const delta = y - targetY;
    if (Math.abs(delta) < 12) return;
    lastFollow = performance.now();
    window.scrollBy({ top: delta, behavior: "smooth" });
  }

  document.addEventListener("focusin", (e) => {
    const path = e.composedPath ? e.composedPath() : [e.target];
    focused = editableFrom(path[0]) || activeEditable();
    requestUpdate();
  }, true);

  document.addEventListener("focusout", () => {
    focused = null;
    hide();
    requestUpdate();
  }, true);

  document.addEventListener("input", (e) => {
    if (!settings.enabled || composing || e.isComposing) return;
    if (!editableFrom(e.target) && !activeEditable()) return;
    const data = typeof e.data === "string" && e.inputType && e.inputType.startsWith("insert")
      ? Array.from(e.data).slice(-1)[0] : "";
    requestAnimationFrame(() => {
      refresh();
      if (lastPoint) {
        if (data) burst(data);
        followCaret();
      }
    });
  }, true);

  document.addEventListener("compositionstart", () => { composing = true; }, true);
  document.addEventListener("compositionend", () => { composing = false; requestUpdate(); }, true);
  document.addEventListener("selectionchange", requestUpdate, true);
  document.addEventListener("keyup", requestUpdate, true);
  document.addEventListener("pointerup", requestUpdate, true);
  document.addEventListener("scroll", requestUpdate, { capture: true, passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  document.addEventListener("visibilitychange", requestUpdate);
  reducedMotion.addEventListener("change", requestUpdate);

  chrome.storage.sync.get({ [KEY]: DEFAULTS }, (result) => {
    if (!chrome.runtime.lastError) applySettings(result[KEY] || DEFAULTS);
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[KEY]) {
      applySettings(changes[KEY].newValue || DEFAULTS);
    }
  });
  requestUpdate();
})();
