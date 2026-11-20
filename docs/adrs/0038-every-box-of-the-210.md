# 0038. Every box of the Formulario 210

- Status: Accepted
- Date: 2026-11-20

## Context

The owner asked to validate and implement the remaining rules so that every box of the 210 (28 to 141) is computed. The rules were checked against the DIAN instructions of the form (2026) and the
Estatuto Tributario.

## Decision

**Engine** (`general-benefits.ts`, `late-filing.ts`, `declaration.ts`; config in `TaxYearConfig`):

- Exempt income and deductions are computed column by column (35–41, 47–53, 63–69, 80–86):
  - AFC, FVP and AVC: up to 30 % of the gross income of the general schedule (32 + 43 + 58 + 74,
    the owner's choice of base) and 3.800 UVT; allocated labor → fees → capital → non-labor, never
    over each column's net income (arts. 126-1 and 126-4).
  - Severance pay and its interest (art. 206 num. 4): exempt share by average monthly salary of the
    last six months (100 % up to 350 UVT, 90 %, 80 %, 60 %, 40 %, 20 %, 0 % above 650 UVT); the
    salary is asked and suggested as salaries ÷ 12. The 25 % (art. 206 num. 10) is computed last and
    never over severance pay.
  - Other exempt labor income within the cap (indemnities, maternity, funeral; box 36).
  - Exempt income without the 40 % cap (Decisión 578 CAN, tax treaties, art. 206 num. 5 to 8), with
    the column it belongs to; asked in Deducciones (owner's choice).
  - GMF 50 % (art. 115) and ICETEX interest up to 100 UVT (art. 119) go to the first column with
    income; severance contributions of independents up to 2.500 UVT and 1/12 of that column's income
    (art. 126-1) go to fees when they have their own column.
  - The 40 % / 1.340 UVT cap applies to every limited benefit; the cap base adds the gross passive
    income of controlled foreign entities (hidden boxes 268–269).
- «Otros ajustes» (step 5, `/otros-ajustes`), each group behind a switch: losses of earlier years
  (56, 72, 89, each up to its column's ordinary income; 94 for 2018 and before, without touching
  labor income), presumptive excess (95, art. 189), rentas gravables (96), ECE passive income (62,
  79), taxes paid abroad (122 up to the Colombian tax on that income, proportional to box 111; 128
  up to box 127), Andean Community dividends (110) and other discounts of arts. 256 and 257-1.
- Renta presuntiva is 0 % (box 98 and 117 are 0).
- Box 123: 25 % of donations (art. 257) plus other discounts, together up to 30 % of box 121
  (art. 258; the 25 % noted earlier was corrected to 30 %). The excess is shown as usable next year.
- Late filing (box 135) from the filing date entered in Resultado: 5 % of box 129 per month or
  fraction up to 100 %; without tax, 0,5 % of gross income up to 5 %, twice the balance in favor or
  2.500 UVT; without income, 1 % of last year's net assets. After a summons (art. 642) the rates
  double. Art. 640: reduced to 50 % without late filing in the two previous years, to 75 % without
  one in the last year, never with a summons. Minimum 10 UVT of the filing year (UVT 2026
  $ 52.374, art. 639). Interest for late payment is not part of the form and is only mentioned.
- Voluntary contribution (box 141, art. 244-1) apart from the balance.
- State version 12 with the new fields, empty.

**Screens**: Deducciones adds the cards of Figma 06f plus «Otras rentas exentas de tu trabajo» and
«Rentas exentas sin el tope del 40 %»; «Otros ajustes» follows Figma 15 and adds ECE amounts, the
foreign income of box 122 and «otros descuentos»; Resultado adds «¿Cuándo vas a presentar?»
(Figma 07b) with the two art. 640 questions. Boxes filled in another screen link to it from the 210.

## Consequences

- No box of the 210 is left at a fixed 0 by the engine.
- Simplifications: box 122 uses a proportional limit; dividends taxed abroad (art. 254 lit. a–d)
  are entered as part of 122; the exogenous report does not fill GMF or severance pay yet.
