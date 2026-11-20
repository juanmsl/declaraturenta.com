/** A natural person preparing their Formulario 210. */
export type Taxpayer = {
  firstName: string;
  fullName: string;
  /** Last two digits of the NIT; they set the filing deadline in the DIAN calendar. Null until known. */
  nitLastDigits: string | null;
  /** ISO date (YYYY-MM-DD) of the filing deadline. Null until the NIT digits are known. */
  filingDeadline: string | null;
};

/** Nobody yet: the app starts empty (ADR 0035). */
export const EMPTY_TAXPAYER: Taxpayer = {
  firstName: '',
  fullName: '',
  nitLastDigits: null,
  filingDeadline: null,
};

export const getInitials = (fullName: string): string =>
  fullName
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');

/**
 * The DIAN writes names as "SURNAME1 SURNAME2 NAME1 NAME2". With four words or more the given
 * names are the last two; with three, the last one.
 */
export const splitDianName = (name: string): { firstName: string; fullName: string } => {
  const words = name
    .split(/\s+/u)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  if (words.length < 2) return { firstName: words[0] ?? '', fullName: words.join(' ') };
  const surnameCount = words.length >= 4 ? 2 : 1;
  const given = words.slice(surnameCount);
  const surnames = words.slice(0, surnameCount);
  return { firstName: given[0] ?? '', fullName: [...given, ...surnames].join(' ') };
};
