# Browser Extensions

A collection of independent Chrome/Chromium Manifest V3 extensions. Load each extension's own folder in `chrome://extensions`; do **not** load the repository root.

## Current extensions

| Folder | Extension | Purpose |
|---|---|---|
| [`minute-flash-clock/`](./minute-flash-clock/) | **Minute Flash Clock** | Flashes the time at every minute with stronger 5/15/30/60-minute tiers. |
| [`browser-dictation/`](./browser-dictation/) | **Browser Dictation** | Speech-to-text into the last focused editable field. |
| [`board-game-lab-ticker/`](./board-game-lab-ticker/) | **Board Game Lab Ticker** | BoardGameGeek collection ticker powered by Board Game Lab's helper endpoint. |
| [`weather-floater/`](./weather-floater/) | **Weather Floater** | Draggable current-weather + 7-day forecast widget with search/current location. |
| [`dev-buddy/`](./dev-buddy/) | **Dev Buddy** | F12-like on-page element/CSS/page/storage/error inspector. |
| [`api-lens/`](./api-lens/) | **API Lens** | REST tester with pretty JSON, raw body, response headers, table view, history and downloads. |
| [`emoji-keys/`](./emoji-keys/) | **Emoji Keys** | A-Z emoji animations and optional letter-to-emoji replacement while typing. |

## Install

1. Clone or download this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select one extension folder, such as `weather-floater`.
6. Repeat for each extension you want enabled.
7. Refresh webpages that were already open.

## Updating after `git pull`

1. Pull the latest `main` branch.
2. Open `chrome://extensions`.
3. Click **Reload** on each changed extension.
4. Refresh the webpage being tested.

## Extension notes

### Minute Flash Clock
Minute classification uses the strongest matching tier: normal minute; 5-minute (`:05`, `:10`, `:20`, `:25`, `:35`, `:40`, `:50`, `:55`); quarter-hour (`:15`, `:45`); half-hour (`:30`); hour (`:00`). Settings include 12/24-hour format, duration, animation, dimming, seconds, chime and per-tier enable/disable.

### Browser Dictation
Click an editable field, then use the popup or keyboard shortcut. Default shortcuts are `Alt+Shift+D` on Windows/Linux/ChromeOS and `Command+Shift+D` on macOS. Supports standard inputs, textareas and many `contenteditable` editors, plus voice punctuation commands.

### Board Game Lab Ticker
Shows BGG collection thumbnails and stats in a bottom overlay. Modes include Most Played, Least Played, Highest Rated, Unplayed and Random. The overlay approach is intentional because universally resizing/reparenting arbitrary websites is unreliable.

### Weather Floater
Toolbar click toggles a draggable weather card. Search by place/ZIP or use current location. Shows current temperature, feels-like, humidity, wind, precipitation probability and a seven-day high/low forecast. Uses Open-Meteo without an API key and remembers its last location, units and position.

### Dev Buddy
A lightweight F12-like overlay. `Inspect` highlights an element and reports selector, attributes, size, computed CSS and text. Other tabs show page metadata, storage/cookies, links, images and captured page errors. It is not a replacement for Chrome DevTools: source debugging, breakpoints, privileged internals and the full network waterfall still require DevTools.

### API Lens
Enter a URL and choose GET/POST/PUT/PATCH/DELETE/HEAD. Add headers as JSON and an optional request body. Results include HTTP status, timing, response size/type, Pretty JSON, exact Raw body, Response Headers and a table view for JSON. Responses can be copied/downloaded, and requests can be saved or reloaded from recent history.

### Emoji Keys
Modes are Off, Animate only, Replace + Animate, and Replace only. A-Z have emoji mappings; Ctrl/Cmd/Alt shortcuts are ignored. Popup settings control emoji size and animation duration.

## Common Chrome limitations

Content scripts cannot run on protected browser pages such as `chrome://...`, the Chrome Web Store and some browser-owned screens. Highly customized editors can also intercept input before an extension can manipulate it. After installing or reloading an extension, refresh existing tabs before testing.

## Repository structure

```text
extensions/
├── README.md
├── api-lens/
├── board-game-lab-ticker/
├── browser-dictation/
├── dev-buddy/
├── emoji-keys/
├── minute-flash-clock/
└── weather-floater/
```

Each extension is self-contained so it can be enabled, changed and reloaded independently.
