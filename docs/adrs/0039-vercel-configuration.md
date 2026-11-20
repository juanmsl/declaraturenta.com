# 0039. Vercel configuration

- Status: Accepted
- Date: 2026-11-20

## Context

The app is hosted on Vercel at app.declaraturenta.com (product.md). It is a single page app with
client routes (`/`, `/inicio`, `/terminos`, `/privacidad`, the steps of the flow), and it keeps
personal tax data in the browser, so the hosting should add the usual security headers.

## Decision

`vercel.json` at the root of the repository:

- Build: framework `vite`, `pnpm install --frozen-lockfile`, `pnpm build`, output `dist`.
- Every path is rewritten to `index.html` so client routes load on refresh or direct visit; files
  that exist (assets, fonts) are served as they are.
- Security headers on every response (owner's choice: basic headers plus a Content Security
  Policy):
  - `Content-Security-Policy`: only the app's own origin for scripts, styles, fonts, images and
    connections; `'wasm-unsafe-eval'` and `blob:` because the PDF of the draft (@react-pdf) needs
    them; inline styles allowed (React style attributes); no objects, no framing, forms only to the
    same origin, HTTP upgraded to HTTPS.
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
    `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`,
    and a `Permissions-Policy` that turns off camera, microphone, geolocation, payment and USB.
- `/assets/*` (hashed file names) is cached for a year as immutable.
- Only app.declaraturenta.com is configured for now. The root domain declaraturenta.com does not
  redirect yet (owner's choice); the domain itself is added in the Vercel dashboard, not in code.

The policy was checked with a production build served with the same headers: landing, Inicio,
Resultado and Formulario 210 load, the PDF downloads and a fictional exógena imports, with no
policy errors in the console.

## Consequences

- Any new external resource (analytics, fonts from a CDN, an API) needs its host added to the
  policy, or the browser blocks it.
- The redirect from declaraturenta.com is still pending.
