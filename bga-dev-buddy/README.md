# BGA Dev Buddy

Experimental Board Game Arena development helper.

## Current features
- Detects whether the current page is BGA or BGA Studio.
- Extracts likely game name/game ID/table ID/player ID from URL parameters, DOM attributes, and selected page globals.
- Probes a small whitelist of BGA globals such as `gameui`, `g_gamethemeurl`, and archive/replay flags when available.
- Lists page scripts, stylesheets, images, and BGA-related local-storage keys.
- Captures page runtime errors/unhandled promise rejections observed after the helper loads.
- Quick links to Studio game panel, BGA table, Studio home, and Studio docs.
- Copy the complete detected context as JSON.

This does not replace BGA Studio logs or browser DevTools; it centralizes context that is otherwise scattered across the page and URL.
