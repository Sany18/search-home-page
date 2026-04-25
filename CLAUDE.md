# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # dev server at http://localhost:8081 with HMR
npm run build    # production bundle → dist/
bash deploy.sh   # build + force-push built files to the `deploy` branch
```

No test runner or linter is configured.

## Architecture

Single-page vanilla JS app (no framework). Two source files:

- [src/scripts.js](src/scripts.js) — all application logic
- [src/styles.css](src/styles.css) — all styles (injected at runtime via style-loader)

Webpack bundles these with [webpack.config.js](webpack.config.js) using HtmlWebpackPlugin to inject the bundle into [public/index.html](public/index.html).

### `$` shorthand

`window.$ = (selector) => document.querySelector(selector)` is defined inline in `public/index.html` before the bundle loads. It is used throughout `scripts.js` as a querySelector alias.

### State

All persistent state lives in `localStorage` under three keys defined at the top of `scripts.js`:
- `searchHistory` — array of up to 100 query strings (newest first, deduped)
- `bookmarks` — array of `{ url, title, icon }` objects
- `excludeRules` — string appended raw to the Google search URL (default: `-ru -и -ы`)

### Search URL construction

The search submits to `https://www.google.com/search` with `udm=14` (forces Web results tab). Exclude rules are appended to the query with spaces replaced by `+` (not URL-encoded separately).

### Deployment

`deploy.sh` maintains a separate `deploy` branch: it resets that branch to `main`, runs the production build, copies `dist/*` to the repo root, and force-pushes. The `deploy` branch is meant to be served directly (e.g. via GitHub Pages) with `bundle.js` and `index.html` at the root.
