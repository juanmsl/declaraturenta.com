# 0031. Pensions, dividends and occasional gains

- Status: Accepted
- Date: 2026-11-19

## Context

The "Otras cédulas" of the 210 (boxes 99–115) stayed at $ 0 with a notice. With the form validated
against the DIAN instructions (ADR 0030), the owner asked to calculate them. Decisions taken with
the owner: the person enters them in sections of the Ingresos screen; pensions ask for the number
of months; occasional gains are entered by kind, and we compute the exempt part and the rate.

## Decision

Engine in `src/domain/other-schedules.ts`, pure functions with tests:

- **Pensions (99–103)**: 101 = 99 − 100 (health and solidarity fund contributions). 102 exempts up
  to 1.000 UVT per month of pension (art. 206 num. 5 E.T.), with the months the person enters
  (12 by default, at most 12). 103 = 101 − 102.
- **Dividends (104–110, 118–120, 124)**: each concept has a kind, as the paying company certifies
  it: 2016 and earlier non-taxed (104 and 105) or taxed (104), 2017 and later 1.ª subcédula (107),
  2.ª subcédula (108) and foreign (109). 118 = 108 × 35 % (art. 240), 119 = art. 241 table in force
  until 2016 over 106, 120 = (109 − 110) × 35 %. 124 = 19 % of (107 + 108 − 118) above 1.090 UVT.
  110 (Andean Community exemption) is not modeled and stays at 0.
- **Box 111** = 97 + 103 + 107 + 108 − 118 (renta presuntiva is 0 %, so 97 is always the larger),
  taxed with the art. 241 table in 116. 121 = 116 + 118 + 119 + 120, 125 = 124, 126 = 121 − 125.
- **Occasional gains (112–115, 127)**: each concept has a kind, an amount (112) and, for sales, a
  fiscal cost (113). 114 is computed per kind: inherited home 13.000 UVT, other inherited real
  estate 6.500 UVT, other inheritances 3.250 UVT, life insurance 3.250 UVT, gifts 20 % up to
  1.625 UVT, personal effects of the deceased fully, home sale 5.000 UVT of the gain only if the
  money went to AFC or to that home's mortgage; lotteries, other asset sales and other gains have
  no exemption. 114 never exceeds 112 − 113. 127 = 20 % of lotteries + 15 % of the rest.
- Filing test 1 (1.400 UVT of gross income) adds pensions, dividends and occasional gains. The
  owner confirmed that occasional gains count in full, exempt part included (arts. 26 and 592
  E.T.).
- **State version 8** adds `pensions`, `dividends` and `occasionalGains` to the data. A version 7
  state or copy is migrated with the schedules empty (`migrateState`), instead of being discarded.

## Consequences

- Simplifications to tell the person in the screens: caps of inheritances apply once per kind for
  the person declaring (we do not split an estate between heirs), and the 2.ª subcédula uses the
  general 35 % rate (the DIAN portal allows other art. 240 rates).
- The screens (Ingresos sections, Formulario 210, Resultado, borrador) are the next step.
