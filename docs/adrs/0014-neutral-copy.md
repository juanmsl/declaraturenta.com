# 0014. Gender-neutral copy

- Status: Accepted
- Date: 2026-11-19

## Context

The Figma copy addresses the sample taxpayer in the feminine ("¿Estás obligada a declarar?",
"como empleada"). Copy lives in the code and must work for every user.

## Decision

Write all user-facing copy in gender-neutral Spanish, even where Figma uses the feminine form
(e.g. "¿Debes declarar renta?", "con uno solo ya tendrías que declarar"). Do not add a gender
field to the profile.

## Consequences

Some strings differ slightly from Figma; the meaning and tone stay the same.
