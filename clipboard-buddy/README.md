# Clipboard Buddy

Searchable local snippet and clipboard helper.

## Features
- Capture the current text clipboard on demand.
- Save selected webpage text from the right-click context menu.
- Add manual snippets and comma-separated tags.
- Pin important snippets, search everything, copy, edit, and delete.
- Keeps up to 250 entries in `chrome.storage.local`.

## Important browser limitation
Chrome extensions cannot silently monitor the operating system clipboard in the background. Clipboard Buddy captures only when you click **Capture Clipboard**, manually save text, or use **Save selection to Clipboard Buddy**.
