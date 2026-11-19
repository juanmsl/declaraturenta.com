# 0033. Fees and other schedules in the income screen

- Status: Accepted
- Date: 2026-11-19

## Context

ADRs 0031 and 0032 calculate fees, pensions, dividends and occasional gains. The owner decided
that the person enters them in the Ingresos screen (the flow keeps 7 steps).

## Decision

- **Honorarios y servicios** appears when the person answers "Sí, honorarios o servicios": fees,
  independent contributions, costs and the choice between "Renta exenta del 25 %" and "Restar
  costos y gastos". Each option shows its tax due; the lower one says so and is applied until the
  person picks one. An alert asks to mark box 140 when costs pass 60 %.
- **Pensiones, dividendos y ganancias ocasionales**: one switch each, the same `activeSchedules`
  as the "Otras cédulas" of the Formulario 210 screen.
  - Pensions: amount (99), health and solidarity contributions (100) and months (12 by default),
    with the exempt amount in the hint.
  - Dividends: one field per kind, each with its box and how the company's certificate names it.
  - Occasional gains: a list; each gain has a kind, a description, an amount, a fiscal cost for
    sales and, for a home sale, the AFC or mortgage switch. Each shows its exempt part.
- A switch that is off (or "No, solo tuve empleo") keeps the values saved but leaves them out of
  the calculation (`effectiveData`).
- The Formulario 210 screen shows the boxes of each active schedule and boxes 140 and 141. The
  detail of a box filled from Ingresos (43–45, 99, 100, 104–109, 112–114) sends the person there.
- Estimates, Resultado, the figures drawer and the draft add "Pensiones y dividendos gravables",
  the box 111 base and the occasional gains tax only when there are any.
- The exogenous import classifies R43, R99, R104, R107–R109 and R112, turns on the schedules that
  have data and asks to confirm 2016-and-earlier dividends and occasional gains.

## Consequences

- The Ingresos screen grows; the sections stay hidden until the person turns them on.
- Figma screen 04 needs the new sections (04d, 04e) to stay in sync.
