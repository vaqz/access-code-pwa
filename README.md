# Access Code PWA

A lightweight, installable PWA served from Cloudflare Workers static assets.

## Production architecture

The PWA uses the Cloudflare Temp Mail API directly. **Google Apps Script and Google Sheets are not part of the production data path.**

- PWA repository: `vaqz/access-code-pwa`
- Production branch: `main`
- Cloudflare Worker: `accesscode-pwa`
- Production hostname: `hh.vaqzmobiz.com`
- Static assets: `./public`
- API base URL: `https://api.vaqzmobiz.com/api/access-codes`
- Backend repository: `vaqz/temp-mail`

### Data and retrieval flow

1. Incoming mail is received and stored by the Cloudflare Temp Mail Worker.
2. The PWA requests profile metadata from the Temp Mail API.
3. When a user selects **Get code**, the PWA calls the API retrieval endpoint.
4. The backend fetches the one-time verification page, extracts the four-digit code, and caches the result in D1.
5. The PWA displays the code returned by the backend. The one-time verification URL is never exposed to the browser.

### Performance and caching

- The PWA refreshes the visible feed every 3 seconds.
- Background polling is paused while the page is hidden.
- The service worker caches only the static app shell.
- API responses and verification data are never cached by the service worker.
- The backend limits the feed to recent messages and caches one-time retrieval results in D1.

## Architecture guardrails

- Do not reintroduce Apps Script, Google Sheets, JSONP, or a spreadsheet polling path.
- Do not move verification-link fetching or code extraction into the browser.
- Do not change the Temp Mail API endpoints, D1 schema, retrieval claim/cache behavior, or three-second refresh behavior for a UI-only change.
- Keep the PWA frontend and Temp Mail backend as separate deployments.
- Make UI-only changes in `public/` unless a backend change is explicitly required.
- Before deployment, verify that the frontend still calls the Cloudflare API and that the retrieval request uses `POST /api/access-codes/:id/retrieve`.

## Cloudflare deployment

- Root directory: repository root
- Build command: none
- Deploy command: `npx wrangler deploy`
- Static assets directory: `./public` (configured in `wrangler.jsonc`)
- Custom domain: `hh.vaqzmobiz.com` (configured in `wrangler.jsonc`)

Do not attach this hostname to the separate `database-pwa` Worker.
