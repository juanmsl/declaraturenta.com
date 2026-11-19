import type { ReactNode } from 'react';

import type { DeclarationResult } from '@/domain/declaration';
import { CalcRow } from '@/shared/ui';

type TaxRowsProps = {
  result: DeclarationResult;
  /** Label of the income tax row ("Impuesto según tabla" in the estimates). */
  taxLabel?: string;
  /** Wraps a label with its box number (figures drawer). */
  withBox?: (label: string, box: number) => ReactNode;
};

/**
 * From the general schedule's taxable income to the tax due: adds pensions and dividends (box
 * 111) and the occasional gains tax (box 127) only when there are any (ADR 0031).
 */
export const TaxRows = ({ result, taxLabel = 'Impuesto sobre la renta', withBox }: TaxRowsProps) => {
  const label = (text: string, box: number) => (withBox ? withBox(text, box) : text);
  const otherSchedules = result.tableBase - result.taxableIncome;

  return (
    <>
      <CalcRow variant='subtotal' label={label('Renta líquida gravable', 97)} value={result.taxableIncome} />
      {otherSchedules > 0 && (
        <>
          <CalcRow label={label('Pensiones y dividendos gravables', 111)} value={otherSchedules} />
          <CalcRow variant='subtotal' label={label('Base del impuesto', 111)} value={result.tableBase} />
        </>
      )}
      <CalcRow label={label(taxLabel, 126)} value={result.netIncomeTax} />
      {result.occasionalGainsTax > 0 && (
        <CalcRow label={label('Impuesto de ganancias ocasionales', 127)} value={result.occasionalGainsTax} />
      )}
    </>
  );
};
