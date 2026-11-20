import type { DeclarationData, DeclarationResult } from '@/domain/declaration';
import { buildForm210 } from '@/domain/form-210';
import type { Taxpayer } from '@/domain/taxpayer';
import type { TaxYearConfig } from '@/domain/tax-years/tax-year';

import { buildDraftRows } from '../draft-rows';

/**
 * Builds the draft PDF and downloads it. @react-pdf/renderer and the fonts are loaded only
 * here, on demand, so they do not weigh on the app bundle.
 */
export const downloadDraftPdf = async (
  taxpayer: Taxpayer,
  data: DeclarationData,
  result: DeclarationResult,
  taxYear: TaxYearConfig,
): Promise<void> => {
  const [{ pdf }, { DraftDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./DraftDocument'),
  ]);
  const boxes = [...buildForm210(data, result, taxYear).values()].sort((a, b) => a.number - b.number);

  const blob = await pdf(
    <DraftDocument
      taxpayer={taxpayer}
      year={taxYear.year}
      rows={buildDraftRows(data, result)}
      boxes={boxes}
      generatedAt={new Date()}
    />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `borrador-formulario-210-ag${String(taxYear.year)}.pdf`;
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};
