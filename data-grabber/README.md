# Data Grabber

Detects structured data in the current webpage and builds a reusable, deduplicated collection.

## Detects
- HTML tables.
- Repeated card/list/grid children with similar markup.

## Collection workflow
- **Add Current Page** adds the selected dataset to a persistent local collection.
- **Auto Load More** looks for same-page controls such as Load More, Show More, See More, More Results, and button-based Next controls, then repeatedly collects newly revealed rows.
- For navigation-based pagination (`<a href=...>`), the extension reports the next URL rather than risking an uncontrolled page navigation. Open the next page and use **Add Current Page**; the persistent session deduplicates rows across pages.

## Export
CSV, JSON, Markdown, or copy JSON to clipboard.

Detection is heuristic: complex virtualized grids, cross-origin iframes, and app-specific pagination can require site-specific handling.
