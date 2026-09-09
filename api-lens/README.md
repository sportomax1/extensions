# API Lens 2.0

Two tools in one extension: a Postman-like REST client and a current-page network/API sniffer.

## API Client
- GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.
- Request headers as JSON and arbitrary text request body.
- Response status, timing, content type, headers, raw body, pretty JSON, and table view.
- Saved requests and recent history.
- Copy and download responses.

## Page Sniffer
Click **Start Sniffing** and then use the current webpage.

Captured after sniffing starts:
- `fetch()` calls with URL, method, request headers/body where observable, status, response headers, textual response body, duration, and a best-effort JS stack.
- `XMLHttpRequest` calls with the same major fields where the browser exposes them.
- Other page resources through the Performance API: scripts, styles, images, fonts, etc., including duration/transfer size where available.
- On first start, existing Performance API resource entries are added as historical resources.

Captured calls can be filtered, copied as JSON/cURL, or loaded into the API Client for replay.

## Limits
- Request/response bodies are capped at about 200k characters to protect extension memory.
- Binary bodies are summarized instead of copied.
- Requests that happened before sniffing started cannot retroactively expose their headers/bodies; only Performance Resource Timing metadata may be available.
- Browser-forbidden headers, HTTP-only cookies, opaque responses, service workers, streaming bodies, and cross-origin/browser security policies can limit what is observable or replayable.
- Refresh the webpage after installing/reloading the extension so its document-start sniffer is present.
