# Browser Extensions

A collection of independent Chrome / Chromium Manifest V3 extensions. Each extension lives in its own folder and can be loaded separately.

> **Important:** in `chrome://extensions`, choose **Load unpacked** and select the individual extension folder — not this repository root.

## Extension catalog

| Folder | Extension | Purpose |
|---|---|---|
| `api-lens/` | **API Lens 2.0** | Postman-like REST client + current-page fetch/XHR/resource sniffer, replay, raw results, headers, cURL, timing. |
| `bga-dev-buddy/` | **BGA Dev Buddy** | BGA/BGA Studio context detector, IDs, assets, page globals, errors, and development shortcuts. |
| `board-game-lab-ticker/` | **Board Game Lab Ticker** | BoardGameGeek / Board Game Lab collection ticker. |
| `browser-dictation/` | **Browser Dictation** | Dictate speech into the last focused webpage text field. |
| `clipboard-buddy/` | **Clipboard Buddy** | Searchable local snippets/clipboard captures with pins, tags, selection capture, and copy/edit/delete. |
| `data-grabber/` | **Data Grabber** | Detect page tables/cards/lists, collect/dedupe rows, handle Load/See More workflows, and export CSV/JSON/Markdown. |
| `dev-buddy/` | **Dev Buddy** | Lightweight on-page developer inspector: elements, computed CSS, DOM/storage/page information, and runtime errors. |
| `emoji-keys/` | **Emoji Keys 2.0** | A–Z emoji mapping with replacement, particles, confetti, trails, sounds, streaks, and heatmap. |
| `minute-flash-clock/` | **Minute Flash Clock** | Time flash at each minute boundary with stronger 5/15/30/60-minute tiers. |
| `pretty-print/` | **Pretty Print** | Auto-format JSON/XML/HTML/CSS/SQL/CSV/TSV/URLs/JWT/Base64/escaped strings/logs/text. |
| `sprite-sheet-inspector/` | **Sprite Sheet Inspector** | Pick webpage images, measure sprite X/Y/W/H, overlay grids, and copy JSON/CSS coordinates. |
| `weather-floater/` | **Weather Floater** | Draggable current-weather + forecast widget with location search and persistent placement. |

---

## Install in Chrome

1. Clone or download this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select one extension folder, for example `extensions/api-lens`.
6. Repeat for any other extensions you want enabled.
7. Refresh webpages that were already open before an extension was installed or reloaded.

### Update after `git pull`

1. Pull the latest repository files.
2. Open `chrome://extensions`.
3. Click **Reload** on each changed extension.
4. Refresh the webpage being tested.

---

# Developer / data tools

## API Lens 2.0

Folder: `api-lens/`

### API Client
- GET / POST / PUT / PATCH / DELETE / HEAD / OPTIONS.
- JSON request-header editor and request body.
- Status, timing, content type, response headers.
- Pretty JSON, raw response, headers, and table views.
- Saved requests + recent history.
- Copy/download responses.

### Page Sniffer
- Captures `fetch()` and `XMLHttpRequest` after sniffing starts.
- Captures URL, method, status, timing, request headers/body where observable, response headers, textual response body, and best-effort initiator stack.
- Also shows non-API resources using Resource Timing.
- On first start, imports existing page resource-timing entries when available.
- Filter by type/URL/status and hide non-API noise.
- **Send to API Client** to replay a captured request.
- Copy request as cURL or complete JSON.

Bodies are intentionally capped to avoid runaway memory use. Browser security rules can hide cookies, forbidden headers, opaque responses, binary/streaming bodies, or other protected data.

## Data Grabber

Folder: `data-grabber/`

- Detects HTML tables automatically.
- Detects repeated card/list/grid structures heuristically.
- Preview a detected dataset.
- Add rows from the current page to a persistent collection.
- Auto-click same-page **Load More / Show More / See More / More Results / Next** controls when safely detectable.
- Deduplicates rows across collection passes.
- For navigation-based pagination, preserves the collection so you can move to the next page and add it.
- Export CSV, JSON, or Markdown.

## Pretty Print

Folder: `pretty-print/`

Auto-detects and formats:

`JSON · XML · HTML · CSS · SQL · CSV · TSV · URL · query string · JWT · Base64 · escaped text · logs · generic text`

Also supports minification, Base64/JWT decoding, unescaping, clipboard paste/copy, and chained transformations.

## Sprite Sheet Inspector

Folder: `sprite-sheet-inspector/`

- Click **Pick an Image on Page**, choose an image, then drag over a sprite.
- Or right-click an image → **Inspect image as sprite sheet**.
- Measures coordinates in the image's natural pixel space.
- Reports `x`, `y`, `width`, `height`.
- Manual coordinate controls and arrow-key nudging.
- Row/column grid overlay.
- Suggests common regular sprite-grid dimensions when the image divides cleanly.
- Copy selection as JSON or CSS `background-position`.

## Dev Buddy

Folder: `dev-buddy/`

A lightweight F12-style helper — not a replacement for Chrome DevTools. It focuses on fast page inspection: element picker, computed CSS, DOM/page statistics, storage, links/images, and captured runtime errors.

## BGA Dev Buddy

Folder: `bga-dev-buddy/`

Experimental BGA-specific helper:
- Detects BGA vs BGA Studio.
- Extracts likely game name, game ID, table ID, and player ID from URLs/DOM/page globals.
- Probes selected globals such as `gameui` and BGA theme/archive variables when present.
- Lists JS/CSS/image assets and BGA-related storage keys.
- Captures runtime errors observed after loading.
- Quick links to Studio game panel, active table, Studio home, and Studio docs.
- Copies the entire discovered context as JSON.

---

# Productivity / visual tools

## Clipboard Buddy

Folder: `clipboard-buddy/`

- **Capture Clipboard** saves the current text clipboard on demand.
- Right-click selected webpage text → **Save selection to Clipboard Buddy**.
- Manual snippets and tags.
- Search, pin, copy, edit, and delete.
- Up to 250 local entries.

Chrome does not allow a normal extension to silently monitor the operating-system clipboard continuously, so capture is explicit.

## Emoji Keys 2.0

Folder: `emoji-keys/`

Modes:
- Off
- Animate only
- Replace letters only
- Replace + animate

Typing effects:
- Float
- Burst
- Confetti
- Trail
- Emoji rain
- Sparkle

Also includes adjustable size/duration/intensity, optional pop/typewriter/bubble/chime sounds, streak boosts, editable A–Z mappings, and a local keyboard heatmap.

## Browser Dictation

Folder: `browser-dictation/`

Dictates into most normal webpage text fields and `contenteditable` areas. Default keyboard shortcut:
- Windows/Linux/ChromeOS: `Alt + Shift + D`
- macOS: `Command + Shift + D`

## Minute Flash Clock

Folder: `minute-flash-clock/`

Strongest matching minute tier wins:
- Ordinary minute → Normal
- `:05 :10 :20 :25 :35 :40 :50 :55` → 5-minute
- `:15 :45` → Quarter hour
- `:30` → Half hour
- `:00` → Top of hour

## Weather Floater

Folder: `weather-floater/`

Draggable weather overlay with current conditions, location search/current location, forecast information, units, and persistent positioning.

## Board Game Lab Ticker

Folder: `board-game-lab-ticker/`

Board-game collection ticker with multiple sorting modes, thumbnails, play/rating information, ticker speed, hover pause, and persistent settings.

---

# Common browser limitations

Normal Chrome extensions cannot inject into protected browser pages such as:
- `chrome://...`
- Chrome Web Store pages
- some browser-owned/internal screens

Some sites use cross-origin iframes, closed shadow DOM, virtualized grids, custom editors, strict CSP/security policies, service workers, or browser APIs that limit what an extension can observe or manipulate.

For development/sniffer extensions, always refresh the webpage after installing or reloading the extension so document-start hooks are present.

---

# Repository structure

```text
extensions/
├── README.md
├── api-lens/
├── bga-dev-buddy/
├── board-game-lab-ticker/
├── browser-dictation/
├── clipboard-buddy/
├── data-grabber/
├── dev-buddy/
├── emoji-keys/
├── minute-flash-clock/
├── pretty-print/
├── sprite-sheet-inspector/
└── weather-floater/
```

Each folder remains self-contained so extensions can be enabled, disabled, developed, or reloaded independently.
