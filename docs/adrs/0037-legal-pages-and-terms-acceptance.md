# 0037. Legal pages and acceptance of the terms

- Status: Accepted
- Date: 2026-11-20

## Context

The owner asked for terms of use, a privacy policy (Ley 1581 de 2012) and a notice that the
platform is not tax advice and has no relation with the DIAN, accepted the first time the app is
used and linked in the footer (Figma 16, 16b and 16c). Responsible party: Juan Sánchez,
juanmsl.pk@gmail.com.

## Decision

- `/terminos` and `/privacidad` (`LegalPage`) share the landing header and footer and work on any
  screen. Their texts live in `src/features/legal/legal-content.ts`, with the date of the version
  (`LEGAL_UPDATED_AT`). They are drafts and must be reviewed by a lawyer before going public.
- The first time the app is opened in a browser, «Antes de empezar» (`TermsDialog`, in
  `AppLayout`) shows three points and a checkbox; «Empezar» is disabled until it is checked and
  the dialog cannot be dismissed otherwise.
- The acceptance is saved in localStorage (`declaraturenta:terms-accepted`) with the version and
  the moment, once for every taxable year. A new version of the texts asks again.
- The side rail ends with «Términos de uso · Privacidad»; the landing footer links them too.

## Consequences

- Changing the texts means updating `LEGAL_UPDATED_AT`, which asks everyone to accept again.
