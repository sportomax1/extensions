# Board Game Lab Ticker

Chrome MV3 extension that displays a bottom overlay ticker from a BoardGameGeek collection using the existing Board Game Lab BGG proxy.

## Install

1. Clone or download this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the `board-game-lab-ticker` folder.
6. Reload a normal webpage.

## Data

Uses the Board Game Lab endpoint `/api/bgg-helper` with `endpoint=collection`, `own=1`, `stats=1`, and `subtype=boardgame`.

## Features

- Board-game thumbnail ticker
- Most Played, Least Played, Highest Rated, Unplayed, Random
- Play counts, rating and BGG rank
- Adjustable game count and speed
- Hover to pause
- Click game to open BoardGameGeek
- Persistent settings across tabs
- Show/hide and manual refresh

The ticker is intentionally a bottom **overlay**. It does not reparent or attempt to resize arbitrary webpages.
