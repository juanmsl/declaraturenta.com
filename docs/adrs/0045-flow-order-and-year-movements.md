# 0045. Patrimonio before Ingresos, and year movements in «Importar exógena»

- Status: Accepted
- Date: 2026-11-20

## Context

The Formulario 210 asks for patrimonio (boxes 29–31) before income, but the flow asked for income
first. The year movements and the VAT question, only used to know whether the person had to file,
were in Patrimonio although they come from the exogenous report.

## Decision

Owner's choices:

- The flow is: Importar exógena → **Patrimonio → Ingresos** → Deducciones → Otros ajustes →
  Resultado → Borrador 210. `FLOW_STEPS` drives the side rail, the braid, the journey list and the
  help guide; the «Atrás» and «Guardar y seguir» buttons follow the new order.
- «Tus movimientos en el año» (credit card, purchases, deposits) move from Patrimonio to «Importar
  exógena», **only once the report is read**, right below the «Esto encontramos» title. Without an
  exogenous report they are not asked: Resultado counts them as zero and says so.
- «¿Eras responsable de IVA?» also moves to «Importar exógena», as its own section at the end of the
  step, **always shown**, with or without the report.
- «Llenar sin exógena» clears only the movements that still match the report; what the person typed
  or corrected stays, and so does the VAT answer.
- Figma: rail and braid in every screen, step labels, journey lists and help guide reordered; new
  screen 03c (141:12908) with the movements and VAT sections, VAT added to 03b (no file); 05e marked
  obsolete.

## Consequences

- Without the exogenous report, the person is never asked about the year movements; Resultado warns
  that if any of them passed its limit, they must file anyway.
