import type { Taxpayer } from '@/domain/taxpayer';

/**
 * Fictional taxpayer used across the Figma flow ("Datos de ejemplo").
 * Not a real person; do not replace with real user data.
 */
export const sampleTaxpayer: Taxpayer = {
  firstName: 'Laura',
  fullName: 'Laura Gómez',
  nitLastDigits: '47',
  filingDeadline: '2026-09-15',
  isSample: true,
};
