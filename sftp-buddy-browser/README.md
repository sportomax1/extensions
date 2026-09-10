# SFTP Buddy Browser

A Chrome side-panel workspace modeled after the iOS SFTP Buddy workflow.

## Architecture

Chrome extensions cannot open ordinary raw SSH/SFTP sockets directly. This extension therefore uses the existing BGA Studio HTTPS bridge at `https://ios-apps-beta.vercel.app/api/bga`, which connects server-side to `1.studio.boardgamearena.com:2022`.

The current bridge intentionally supports BGA Studio only. It is not an arbitrary-host SFTP client.

## SFTP workspace

- Session-only password storage; username/path persisted locally.
- Connect/health check.
- Browse directories, filter rows, breadcrumbs/up navigation.
- Open/edit/save text files.
- Backup-before-save using `.bak-<timestamp>` copies.
- Create files/folders.
- Upload/download files.
- Rename/move.
- Soft-delete by moving items into `.sftp-trash`.
- Remote file metadata.
- Approximately 3 MB safe per-file browser transfer cap because bridge files are Base64-wrapped inside JSON and the hosting function has a much smaller request/response ceiling than native SFTP.

## GitHub workspace

- Session-only fine-grained PAT.
- Browse accessible repositories and folders using GitHub's REST Contents API.
- Open/edit/commit text files.
- Delete a selected repository file with a commit.

## Sync

- GitHub file → SFTP destination, with SFTP backup when overwriting.
- SFTP file → GitHub destination, creating or updating via blob SHA.
- Basic before/after line comparison for selected text files.

## Deliberate limitations

- No raw/direct SFTP from Chrome; the HTTPS bridge is required.
- The current bridge is BGA-only.
- No full local Git implementation: clone, merge, rebase, conflict graphs, and multi-commit history manipulation are outside this extension.
- Chrome extension storage is not equivalent to iOS Keychain. Passwords/tokens are therefore session-only and are cleared with the browser session rather than persisted.
- Very large or binary workflows should use the native app or desktop SFTP tooling.
