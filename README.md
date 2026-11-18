# Access Code PWA

A read-only installable PWA for the Google Sheet tab named `Access Code`.

## Cloudflare deployment

This is a standalone repository so the existing `vaqz/database-pwa` repository and deployment remain untouched.

- Cloudflare Worker name: `accesscode-pwa`
- GitHub repository: `vaqz/access-code-pwa`
- Production branch: `main`
- Root directory: leave blank / repository root
- Build command: `None` / empty
- Deploy command: `npx wrangler deploy`
- Static assets directory: `./public` (configured in `wrangler.jsonc`)
- Custom domain: `hh.vaqzmobiz.com` (configured in `wrangler.jsonc`)

If the domain cannot be attached during deployment, open the new `accesscode-pwa` Worker → Settings → Domains & Routes → Add → Custom Domain and enter `hh.vaqzmobiz.com`. Do not add the hostname to the existing `database-pwa` Worker.

## App behavior

- Reads profile names, verification URLs and timestamps from the Apps Script JSONP endpoint.
- Copies or opens verified Netflix travel verification links.
- Auto-syncs every 3 seconds.
- Service worker caches the app shell only; API responses and verification links are not cached.
- Apps Script source is in `apps-script/Code.gs`; it reads only columns B:C and F, never column A.

## Public endpoint warning

The Apps Script endpoint is intentionally public as requested. Anyone who obtains its URL may be able to retrieve the returned profile names and verification links. Treat verification links as bearer tokens and do not share them outside the intended audience.
