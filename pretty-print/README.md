# Pretty Print

A general-purpose formatter for text strings, not just JSON.

## Auto-detected formats
JSON, XML, HTML, CSS, SQL, CSV, TSV, URLs, query strings, JWTs, Base64-looking text, escaped strings, logs, and generic text.

## Actions
- Format / pretty-print.
- Minify where meaningful.
- Decode Base64/JWT payloads and unescape text.
- Paste directly from clipboard.
- Copy formatted output.
- Move output back to input for another transformation.

Formatting is intentionally dependency-free and heuristic for SQL/HTML/CSS. JWT decoding does **not** verify signatures.
