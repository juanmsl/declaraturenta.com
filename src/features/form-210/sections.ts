/** Sections of the Formulario 210 screen (Figma 09), shared by the page and the detail panel. */
export const BOX_SECTIONS: { title: string; from: number; to: number }[] = [
  { title: 'Datos generales', from: 28, to: 28 },
  { title: 'Patrimonio', from: 29, to: 31 },
  { title: 'Cédula general', from: 32, to: 90 },
  { title: 'Renta líquida gravable de la cédula general', from: 91, to: 98 },
  { title: 'Otras cédulas', from: 99, to: 115 },
  { title: 'Impuesto sobre las rentas líquidas gravables', from: 116, to: 121 },
  { title: 'Descuentos tributarios', from: 122, to: 125 },
  { title: 'Liquidación privada', from: 126, to: 133 },
  { title: 'Saldo', from: 134, to: 139 },
];

export const sectionOf = (box: number): string =>
  BOX_SECTIONS.find(section => box >= section.from && box <= section.to)?.title ?? 'Formulario 210';
