# 0010. Self-hosted fonts with Fontsource

- Status: Accepted
- Date: 2026-11-19

## Context

The design uses Bricolage Grotesque (titles) and Figtree (interface and figures). The app handles
tax data, so we avoid third-party requests.

## Decision

Install `@fontsource-variable/bricolage-grotesque` (the `standard` file, with the opsz, wdth and
wght axes) and `@fontsource-variable/figtree`, imported from `src/styles/index.css` and bundled
by Vite.

## Consequences

No calls to Google Fonts. Font files ship with the build (about 240 KB across subsets, loaded
on demand by unicode range).
