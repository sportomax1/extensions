# Cursor Flow

Cursor Flow is a standalone Chrome/Chromium Manifest V3 extension that creates a gentle Alhora-like writing atmosphere **at the active text caret on existing webpages**. It does not replace the page editor or alter submitted text.

## What it does

- Tracks the caret in ordinary text inputs, textareas, and many contenteditable editors.
- Shows a soft glow, a subtle writing-line highlight, or both.
- Briefly animates typed characters and a small pulse (visual-only).
- Offers sunset, ocean, lilac, and neutral themes, plus strength control.
- Optional scrolling: disabled by default, near-edge follow, or center follow.
- Works in supported frames when Chrome permits injection.
- Respects the operating system's reduced-motion preference.
- Saves **only extension settings** using Chrome sync storage. No telemetry, network requests, typed content collection, or text modification.

## Install

1. Clone/download the parent extensions repository.
2. Open chrome://extensions in Chrome and enable Developer mode.
3. Choose **Load unpacked**, selecting the cursor-flow folder (not the repository root).
4. Refresh any webpage already open, then click the Cursor Flow icon to configure it.
5. Focus a normal search field, email compose body, or webpage textarea and type.

## Defaults

- Enabled, warm sunset, glow + writing line, floating letters on.
- Strength 60%.
- Page scrolling OFF, so forms and site layouts do not unexpectedly jump.

## Browser limitations

This extension works best in native text inputs, textareas, and regular contenteditable surfaces. It cannot inject into chrome:// pages, Chrome Web Store, other browser-owned pages, or restricted origins. Google Docs/Sheets canvases, Monaco, CodeMirror, closed shadow DOM, certain rich editors, cross-origin frames without permission, and highly customized widgets may need dedicated integration. The caret effects are a best-effort visual overlay, not real font or editor changes.

Password inputs and fields with sensitive labels (OTP, card numbers, bank information, etc.) are intentionally excluded. Some email/native input caret measurements may be approximate because browser selection APIs are restricted. The optional scroll modes move the page, not internal scrollers in every bespoke editor.

## Files

- manifest.json — MV3 permissions and automatic page injection
- content.js — caret detection, visual overlay, effects and optional following
- popup.html / popup.css / popup.js — settings UI

No build tools, external dependencies, or backend are required.
