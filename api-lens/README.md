# API Lens

A compact REST/API tester in a Chrome extension popup.

## Features
- GET, POST, PUT, PATCH, DELETE, and HEAD.
- Custom request headers as JSON.
- Request body editor.
- HTTP status/status text, timing, response size, and content type.
- Pretty JSON view.
- Exact raw response body view.
- Response-header view.
- Table view for JSON objects/arrays.
- Copy and download response.
- Saved requests and recent history.
- Example endpoints for quick testing.

## Important
`host_permissions` allows the extension popup to request HTTP/HTTPS endpoints directly. Authentication, endpoint-specific security rules, TLS errors, and server-side origin restrictions can still cause failures.
