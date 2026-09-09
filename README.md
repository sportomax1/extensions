# Browser Extensions

A collection of small browser extensions for productivity, time awareness, and Board Game Lab / BoardGameGeek tools.

Each extension lives in its own folder and can be loaded independently. You do **not** load the repository root as an extension; load the specific extension folder you want to use.

## Extensions

| Folder | Extension | What it does |
|---|---|---|
| [`minute-flash-clock/`](./minute-flash-clock/) | **Minute Flash Clock** | Flashes the current digital time at the start of every minute, with stronger visual treatment for 5-, 15-, 30-, and 60-minute marks. |
| [`browser-dictation/`](./browser-dictation/) | **Browser Dictation** | Converts speech to text and inserts it at the last focused text field/caret on a webpage. |
| [`board-game-lab-ticker/`](./board-game-lab-ticker/) | **Board Game Lab Ticker** | Shows a bottom ticker of BoardGameGeek collection games using Board Game Lab's BGG helper endpoint. |

---

# Install an extension in Chrome

These are currently set up as **unpacked Chrome Manifest V3 extensions**.

1. Clone or download this repository.
2. Open Chrome.
3. Go to:

   ```text
   chrome://extensions
   ```

4. Turn on **Developer mode** in the upper-right corner.
5. Click **Load unpacked**.
6. Select the folder for the extension you want, for example:

   ```text
   extensions/minute-flash-clock
   ```

7. Repeat **Load unpacked** for any additional extension folders you want enabled.
8. Refresh webpages that were already open before the extension was installed.

## Updating after a Git pull

When files change in GitHub:

1. Pull the newest repository version.
2. Open `chrome://extensions`.
3. Find the extension.
4. Click **Reload** on its extension card.
5. Refresh the webpage you are testing.

You normally do **not** need to remove and reinstall the extension after each update.

---

# Minute Flash Clock

Folder: [`minute-flash-clock/`](./minute-flash-clock/)

Flashes a large digital clock at the exact beginning of each new minute.

## Minute classifications

The strongest matching tier wins:

| Minute mark | Classification |
|---|---|
| Every unlisted minute | Normal minute |
| `:05, :10, :20, :25, :35, :40, :50, :55` | 5-minute |
| `:15, :45` | Quarter hour |
| `:30` | Half hour |
| `:00` | Top of hour |

Higher tiers are progressively more noticeable.

## Main settings

- Enable / disable the extension
- 12-hour or 24-hour time
- Flash duration
- Zoom, slide, flip, or pulse animation
- Optional page dimming
- Optional seconds
- Optional tiered chime
- Enable / disable individual minute tiers
- Test any tier immediately

## Example

```text
2:37:00  → Normal flash
2:40:00  → 5-minute flash
2:45:00  → Quarter-hour flash
3:00:00  → Hourly flash
```

See [`minute-flash-clock/README.md`](./minute-flash-clock/README.md) for more details.

---

# Browser Dictation

Folder: [`browser-dictation/`](./browser-dictation/)

Lets you dictate into most normal webpage text fields instead of typing.

## Basic use

1. Click inside the text field where you want the text inserted.
2. Start dictation using the keyboard shortcut or extension popup.
3. Speak normally.
4. Final recognized speech is inserted at the remembered caret position.
5. Stop dictation with the same shortcut or popup button.

## Default keyboard shortcut

| Platform | Shortcut |
|---|---|
| Windows / Linux / ChromeOS | `Alt + Shift + D` |
| macOS | `Command + Shift + D` |

Using the keyboard shortcut is generally best because opening the popup can move browser focus away from the field you were editing.

## Supported editor types

- Standard text inputs
- Search boxes
- Textareas
- Most `contenteditable` editors

Highly customized JavaScript editors may require site-specific support.

## Voice commands

When voice punctuation commands are enabled, standalone phrases include:

- `new line`
- `new paragraph`
- `comma`
- `period`
- `full stop`
- `question mark`
- `exclamation point`
- `colon`
- `semicolon`

## Other features

- Continuous listening
- Language selector
- Optional automatic spaces
- Floating listening / transcript indicator
- Toolbar `ON` badge while dictation is active
- Chrome-synced settings

See [`browser-dictation/README.md`](./browser-dictation/README.md) for more details.

---

# Board Game Lab Ticker

Folder: [`board-game-lab-ticker/`](./board-game-lab-ticker/)

Adds a bottom overlay ticker containing games from a BoardGameGeek collection.

It uses the existing Board Game Lab BGG helper endpoint with collection data.

## Main features

- Board-game thumbnail ticker
- Most Played
- Least Played
- Highest Rated
- Unplayed
- Random
- Play counts
- Ratings
- BGG rank
- Adjustable number of games
- Adjustable ticker speed
- Hover to pause
- Click a game to open BoardGameGeek
- Persistent settings
- Manual refresh
- Show / hide controls

The ticker is intentionally implemented as an **overlay** rather than attempting to resize or rewrite arbitrary webpages.

See [`board-game-lab-ticker/README.md`](./board-game-lab-ticker/README.md) for more details.

---

# Repository structure

```text
extensions/
├── README.md
├── board-game-lab-ticker/
│   ├── manifest.json
│   ├── ...
│   └── README.md
├── browser-dictation/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   └── README.md
└── minute-flash-clock/
    ├── manifest.json
    ├── content.js
    ├── popup.html
    ├── popup.js
    └── README.md
```

Each folder should remain self-contained so one extension can be changed or reloaded without affecting the others.

---

# Common limitations

Chrome prevents normal extensions from injecting content scripts into certain protected pages, including:

- `chrome://...` pages
- The Chrome Web Store
- Some built-in browser pages

When testing an extension, use a normal webpage such as a regular website or local development page.

If an extension was just installed or reloaded, refresh the webpage before assuming the extension is not working.

---

# Development workflow

A simple workflow for changes is:

```text
Edit extension files
        ↓
Commit / push to main
        ↓
Pull latest files on the computer running Chrome
        ↓
chrome://extensions
        ↓
Reload the affected extension
        ↓
Refresh the test webpage
```

Because each project is isolated in its own directory, future browser extensions can be added as additional top-level folders without changing the existing ones.
