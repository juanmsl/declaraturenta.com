# 0046. The scroll stays put when a box panel opens or closes

- Status: Accepted
- Date: 2026-11-21

## Context

In the Formulario 210 screen, opening a box moved the page (it centered the box) and closing the
panel sent the page to the top. The panel state lives in the URL (`?casilla=38`), so every change
was a navigation, and `ScrollRestoration` (ADR 0043) took each one to the top. While testing it, a
second bug showed up: on a full page load every location has React Router's key `"default"`, so a
fresh load restored the scroll saved for another page.

## Decision

- Opening and closing a box changes the URL with `preventScrollReset`, so the scroll stays where it
  is.
- Only a link from another screen (e.g. the draft's «ver en el 210») scrolls to its box, once, on
  arrival, in the frame after `ScrollRestoration` runs.
- `ScrollRestoration` uses the path as the key when the location key is `"default"` (full page
  load), so pages no longer share a saved position.
- End-to-end tests: `e2e/form-210.spec.ts`.
