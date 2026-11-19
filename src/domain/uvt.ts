/** Taxable year being declared (año gravable). Filed during the following calendar year. */
export const TAX_YEAR = 2025;

/** UVT (Unidad de Valor Tributario) for the taxable year 2025, in COP (DIAN Resolución 000193 de 2024). */
export const UVT_2025 = 49_799;

/** Converts an amount in UVT to pesos, rounded to the peso. */
export const uvtToPesos = (uvt: number, uvtValue: number = UVT_2025): number => Math.round(uvt * uvtValue);

/** Converts pesos to UVT without rounding. */
export const pesosToUvt = (pesos: number, uvtValue: number = UVT_2025): number => pesos / uvtValue;

/** Values on DIAN forms are rounded to the nearest multiple of 1.000 (art. 577 E.T.). */
export const roundToThousand = (value: number): number => Math.round(value / 1000) * 1000;
