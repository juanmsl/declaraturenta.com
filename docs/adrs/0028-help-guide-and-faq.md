# 0028. Help: guide and searchable frequent questions

- Status: Accepted
- Date: 2026-11-19

## Context

The "Ayuda" button had no behavior. The owner asked for a guide on how the platform works and an
aside with frequent questions that can be filtered by concept, and chose a side panel with two
tabs, offered the first time in Inicio.

## Decision

- **Panel**: "Ayuda" in the top bar opens `HelpDrawer` (the project `Drawer`, 560 px) with Polpo
  `Tabs`: "Guía" and "Preguntas frecuentes". `HelpProvider` (inside `AppLayout`) lets any screen
  open it on a tab.
- **Guía**: the seven steps with one sentence each, three tips (live estimate, box detail in the
  210, local copy) and a note that it is general guidance for taxable year 2025 and does not
  replace an accountant.
- **Preguntas frecuentes**: 20 questions in three groups (La plataforma, Tus datos, Conceptos),
  shown with Polpo `Accordion`. The search field filters by every word of the query in the
  question, the answer and extra keywords (box numbers, synonyms), ignoring accents and case
  (`features/help/help-content.ts`). Figures come from the engine's rules: UVT 2025, filing tests,
  caps, the 40 % limit, dependents, the inflationary component and the advance.
- **First time**: Inicio shows a "¿Primera vez aquí?" card with "Ver la guía" and "Ahora no".
  Either action hides it for good (`helpIntroDismissed`, state version 7).
- Polpo tab and accordion styles are adjusted in `polpo-overrides.css` (scoped to `.help-tabs`
  and `.faq`): violet underline for the open tab, line-colored separators, chevron icon.

## Consequences

- The content is static and in Spanish in the code; when a rule changes (new taxable year), the
  answers must be reviewed with the engine.
- Tests stub `ResizeObserver`, which Polpo modals use even when closed.
