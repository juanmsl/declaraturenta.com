import { createInitialState } from '@/app/declaration/declaration-state';
import type { DeclarationState } from '@/app/declaration/declaration-state';

import { sampleDeclaration } from './sample-declaration';
import { sampleExogenous } from './sample-exogenous';
import { sampleTaxpayer } from './sample-taxpayer';

/**
 * The fictional sample taxpayer as a saved state, for tests only: the app itself starts empty
 * (ADR 0035).
 */
export const createSampleState = (): DeclarationState => ({
  ...createInitialState(),
  data: structuredClone(sampleDeclaration),
  taxpayer: { ...sampleTaxpayer },
  exogenous: {
    fileName: 'exogena-ejemplo.xlsx',
    confirmedItems: [],
    report: structuredClone(sampleExogenous),
  },
});
