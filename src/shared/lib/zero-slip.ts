/**
 * Detects a likely missing or extra zero compared with a reported value
 * (Figma "Campo monetario" error state: "Revisa si te faltó un cero").
 */
export type ZeroSlip = 'missing' | 'extra' | null;

export const detectZeroSlip = (value: number, reported: number): ZeroSlip => {
  if (value <= 0 || reported <= 0) return null;
  const ratio = value / reported;
  if (ratio > 0.09 && ratio < 0.11) return 'missing';
  if (ratio > 9 && ratio < 11) return 'extra';
  return null;
};
