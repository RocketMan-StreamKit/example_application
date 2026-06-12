# Example Application

Demo application addon for StreamKit+ — settings in the host app, UI in a sandboxed `BrowserWindow`, data via addon HTTP endpoints.

## Install

1. **Settings → Applications → Install from folder** → select this directory.
2. Enable the addon and adjust settings (title, colors, refresh interval).
3. Open **Applications** in the main window and launch **Example Application**.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | `type: application`, `web_type: application` |
| `index.html` | Application page loaded in the sandbox window |
| `style.css` | App UI styles |
| `index.js` | Worker: settings schema + HTTP API |
| `main.js` | Fetches params/state, sends POST increment |
| `logo.svg` | Icon |

## Worker API

All routes are under `/addon/{addonId}/…`. The page passes `?token=` from its URL (addon frontend access token).

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `params` | Current settings from `api.config.getParams()` |
| `GET` | `state` | Random value, click counter, refresh timestamp |
| `POST` | `increment` | Body `{ "delta": 1 }` — increments worker counter |

## Settings

| Key | Type | Default |
| --- | --- | --- |
| `label` | text | Example application |
| `maxRandom` | number | 999 |
| `accentColor` | color | #3b82f6 |
| `refreshInterval` | number | 2 (seconds) |
| `showTimestamp` | boolean | true |
