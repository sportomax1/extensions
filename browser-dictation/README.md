# Browser Dictation

Chrome Manifest V3 extension that converts speech to text and inserts final recognized phrases into the last focused editable field on the current webpage.

## Features

- Dictate into text inputs, textareas, and `contenteditable` editors.
- Inserts text at the remembered caret/selection.
- Keyboard toggle so focus can remain in the webpage.
- Default shortcut:
  - Windows/Linux/ChromeOS: `Alt+Shift+D`
  - macOS: `Command+Shift+D`
- Continuous listening mode.
- Optional automatic space after phrases.
- Small floating listening/transcript indicator.
- Voice punctuation commands.
- Language selector.
- ON badge while dictation is active.

## Voice commands

When Voice punctuation commands is enabled, say one of these as a standalone phrase:

- `new line`
- `new paragraph`
- `comma`
- `period` / `full stop`
- `question mark`
- `exclamation point`
- `colon`
- `semicolon`

## Install from this repository

1. Clone or download the `extensions` repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `browser-dictation` folder.
6. Refresh webpages that were already open before the extension was installed/reloaded.

## Use

1. Click inside the field/editor where you want dictated text inserted.
2. Press the dictation shortcut, or open the extension popup and click **Start Dictation**.
3. Grant speech/microphone access if Chrome asks.
4. Speak normally.
5. Press the shortcut again or use the popup to stop.

## Notes / browser limitations

- Chrome does not allow content-script injection on protected pages such as `chrome://...`, the Chrome Web Store, and some browser-owned screens.
- Some highly customized web editors may implement their own input model and can require site-specific handling.
- SpeechRecognition/Web Speech behavior depends on the Chromium browser and its speech service availability.
- The current implementation targets the top-level page. Editors inside cross-origin iframes may not be reachable.
- For the most reliable cursor preservation, use the keyboard shortcut rather than opening the popup after placing the caret.

## Files

- `manifest.json` — Manifest V3 configuration and shortcut.
- `background.js` — handles the global extension command and toolbar badge.
- `content.js` — speech recognition, caret tracking, text insertion, and listening indicator.
- `popup.html` — settings and controls.
- `popup.js` — popup state/settings logic.
