/** A natural person preparing their Formulario 210. */
export type Taxpayer = {
  firstName: string;
  fullName: string;
  /** Last two digits of the NIT; they set the filing deadline in the DIAN calendar. */
  nitLastDigits: string;
  /** ISO date (YYYY-MM-DD) of the filing deadline. */
  filingDeadline: string;
  /** True for the fictional example taxpayer shown while there is no real data. */
  isSample: boolean;
};

export const getInitials = (fullName: string): string =>
  fullName
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
