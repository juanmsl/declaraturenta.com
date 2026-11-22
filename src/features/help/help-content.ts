/**
 * Content of the help panel (ADR 0028): how the platform works and frequent questions. General
 * guidance for taxable year 2025; it does not replace advice from an accountant.
 */

export const GUIDE_STEPS: readonly { title: string; text: string }[] = [
  {
    title: 'Importar exógena',
    text: 'Sube el Excel de información exógena que descargas del portal de la DIAN. Lo leemos en tu navegador y llevamos cada dato a su casilla; tú confirmas lo marcado y revisas tus movimientos del año.',
  },
  {
    title: 'Patrimonio',
    text: 'Lo que tenías y lo que debías al 31 de diciembre. Agrega, edita o quita bienes y deudas.',
  },
  {
    title: 'Ingresos',
    text: 'Revisa lo que recibiste por tu trabajo, tus rendimientos financieros y otros ingresos. Corrige si tus certificados dicen otra cosa.',
  },
  {
    title: 'Deducciones',
    text: 'Intereses de vivienda, dependientes, medicina prepagada y la renta exenta del 25 %. Te mostramos cuándo llegas al tope del 40 %.',
  },
  {
    title: 'Otros ajustes',
    text: 'Casos poco comunes: sociedades del exterior, impuestos pagados en otro país, dividendos de la Comunidad Andina y otros descuentos. Si no te aplican, sigue de largo.',
  },
  {
    title: 'Resultado',
    text: 'Ves si tienes saldo a pagar o a favor, cómo llegamos a esa cifra, si tenías que declarar y la sanción si presentas tarde.',
  },
  {
    title: 'Borrador 210',
    text: 'Tu formulario con cada casilla. Descárgalo en PDF y transcríbelo en el portal de la DIAN, donde lo firmas y presentas.',
  },
];

export const GUIDE_TIPS: readonly string[] = [
  'El panel «Así va tu declaración» se actualiza con cada respuesta.',
  'En el Formulario 210 toca una casilla para ver qué conceptos la forman y editarlos.',
  'Tus datos se guardan solos en este navegador. Con «Mis datos» los descargas en un archivo y los cargas en otro computador.',
];

export type FaqCategory = 'La plataforma' | 'Conceptos' | 'Tus datos';

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  /** Extra words people search with (boxes, synonyms). */
  keywords: string;
};

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'what',
    category: 'La plataforma',
    question: '¿Qué hace Declara tu renta?',
    answer:
      'Te ayuda a preparar el Formulario 210 de personas naturales con preguntas sencillas y la información exógena de la DIAN. No presenta la declaración por ti: al final te da un borrador para transcribir en el portal de la DIAN.',
    keywords: 'formulario 210 plataforma para qué sirve',
  },
  {
    id: 'file',
    category: 'La plataforma',
    question: '¿Cómo presento la declaración?',
    answer:
      'Entra al portal de la DIAN, abre el Formulario 210 del año gravable 2025, pasa las cifras del borrador casilla por casilla, fírmalo con tu firma electrónica y preséntalo antes de tu fecha límite. Si tienes saldo a pagar, lo pagas con el recibo que genera el portal.',
    keywords: 'presentar firma electrónica portal DIAN pagar',
  },
  {
    id: 'not-yet',
    category: 'La plataforma',
    question: '¿Calculan todas las casillas del 210?',
    answer:
      'Sí, de la 28 a la 141. Algunas dependen de datos que solo tú tienes, como impuestos pagados en el exterior o rentas de sociedades del exterior: los preguntamos en «Otros ajustes». Las pérdidas de años anteriores, los excesos de renta presuntiva y las rentas gravables se agregan en su casilla del Formulario 210 (56, 72, 89, 94, 95 y 96). Lo que no sale de la exógena hay que escribirlo con tus certificados.',
    keywords: 'casillas calculan todas compensaciones pérdidas renta presuntiva donaciones exterior',
  },
  {
    id: 'fees-option',
    category: 'Conceptos',
    question: '¿Resto costos o tomo el 25 % exento en mis honorarios?',
    answer:
      'La ley te deja una de las dos, no ambas. Calculamos tu declaración con cada una y te sugerimos la que deja menos impuesto; tú confirmas en Ingresos. Si tus costos pasan del 60 % de tus honorarios debes marcar la casilla 140.',
    keywords: 'honorarios independiente costos gastos 25 % exenta casilla 43 casilla 140',
  },
  {
    id: 'other-schedules',
    category: 'Conceptos',
    question: '¿Cómo declaro pensiones, dividendos y ganancias ocasionales?',
    answer:
      'Actívalos en Ingresos. De la pensión no pagan impuesto hasta 1.000 UVT por mes. Los dividendos se separan según el certificado de la empresa. En las ganancias ocasionales eliges el tipo (herencia, venta, lotería…) y calculamos la parte exenta y la tarifa de 15 % o 20 %.',
    keywords: 'pensión jubilación dividendos acciones herencia lotería venta casa ganancia ocasional',
  },
  {
    id: 'deadline',
    category: 'La plataforma',
    question: '¿Cuál es mi fecha límite?',
    answer:
      'Depende de los dos últimos dígitos de tu NIT, sin el dígito de verificación. Para el año gravable 2025 los plazos de personas naturales fueron del 12 de agosto al 26 de octubre de 2026. Presentar tarde genera una sanción.',
    keywords: 'plazo vencimiento calendario fecha NIT sanción extemporánea',
  },
  {
    id: 'where-data',
    category: 'Tus datos',
    question: '¿Dónde quedan mis datos?',
    answer:
      'Solo en este navegador. No tenemos cuentas ni servidores con tu información. Si borras los datos del navegador o cambias de computador, usa «Mis datos» para no perderlos.',
    keywords: 'privacidad seguridad navegador guardar',
  },
  {
    id: 'copy',
    category: 'Tus datos',
    question: '¿Cómo guardo mis datos o los paso a otro computador?',
    answer:
      'En la barra superior toca «Mis datos» y luego «Descargar datos»: se descarga un archivo .json. En el otro computador toca «Mis datos» y «Cargar datos» y elige ese archivo. Guárdalo en un lugar seguro: tiene tu información personal.',
    keywords: 'mis datos copia respaldo backup json descargar cargar abrir',
  },
  {
    id: 'no-exogenous',
    category: 'Tus datos',
    question: '¿Qué hago si no tengo la exógena?',
    answer:
      'Toca «Llenar sin exógena» y escribe los valores de tus certificados: ingresos y retenciones de tu empleador, saldos bancarios, intereses de vivienda y medicina prepagada.',
    keywords: 'exógena certificado sin archivo',
  },
  {
    id: 'review',
    category: 'Tus datos',
    question: '¿Qué significan «Confirma» y «Revisar»?',
    answer:
      'Son datos que debes comparar con tus certificados antes de usarlos: un aporte que dos entidades reportaron igual, los intereses de vivienda o un vehículo reportado con su avalúo.',
    keywords: 'confirmar revisar duplicado chip',
  },
  {
    id: 'vehicle',
    category: 'Tus datos',
    question: '¿Por qué el vehículo se marca para revisar?',
    answer:
      'La DIAN reporta el avalúo del vehículo como dato informativo. En la declaración va su costo fiscal, que en general es lo que pagaste por él. Corrígelo en Patrimonio.',
    keywords: 'carro moto vehículo avalúo costo fiscal patrimonio casilla 29',
  },
  {
    id: 'exogenous',
    category: 'Conceptos',
    question: '¿Qué es la información exógena?',
    answer:
      'Es lo que empleadores, bancos, fondos y otras entidades le reportaron a la DIAN sobre ti. Puede tener errores o vacíos, por eso nada se usa sin tu confirmación.',
    keywords: 'exógena reporte terceros',
  },
  {
    id: 'uvt',
    category: 'Conceptos',
    question: '¿Qué es la UVT?',
    answer:
      'La Unidad de Valor Tributario. Los topes y límites se expresan en UVT; para 2025 una UVT vale $ 49.799.',
    keywords: 'uvt unidad valor tributario',
  },
  {
    id: 'must-file',
    category: 'Conceptos',
    question: '¿Cómo sé si debo declarar?',
    answer:
      'Debes declarar si en 2025 superaste uno de estos topes: patrimonio bruto mayor a 4.500 UVT ($ 224.095.500), ingresos brutos de 1.400 UVT ($ 69.718.600) o más (cuentan también herencias, loterías y otras ganancias ocasionales, aunque estén exentas), o consumos con tarjeta, compras o consignaciones mayores a 1.400 UVT.',
    keywords: 'topes obligado declarar patrimonio ingresos tarjeta consignaciones',
  },
  {
    id: 'non-taxable',
    category: 'Conceptos',
    question: '¿Qué son los ingresos no constitutivos de renta?',
    answer:
      'Ingresos que la ley no grava, como los aportes obligatorios a pensión y salud (casilla 33) y el componente inflacionario de tus rendimientos financieros (casilla 59). Se restan antes de calcular.',
    keywords: 'no constitutivos aportes pensión salud casilla 33 casilla 59',
  },
  {
    id: 'inflation',
    category: 'Conceptos',
    question: '¿Qué es el componente inflacionario?',
    answer:
      'La parte de los intereses y rendimientos financieros que solo compensa la inflación. Para 2025 el 55,43 % no es renta (Decreto 0898 de 2026); lo restamos por ti en la casilla 59.',
    keywords: 'rendimientos financieros cdt intereses inflación casilla 58 casilla 59',
  },
  {
    id: 'benefits',
    category: 'Conceptos',
    question: '¿Qué puedo restar como deducciones y rentas exentas?',
    answer:
      'El 25 % exento de tus pagos laborales (hasta 790 UVT), los intereses del crédito de vivienda (hasta 1.200 UVT), el 10 % por dependientes (hasta 384 UVT), la medicina prepagada (hasta 192 UVT) y los aportes voluntarios a pensión y cuentas AFC.',
    keywords:
      'deducciones exentas vivienda prepagada dependiente afc voluntarios casilla 35 casilla 38 casilla 39',
  },
  {
    id: 'cap',
    category: 'Conceptos',
    question: '¿Por qué hay un tope del 40 %?',
    answer:
      'La ley limita la suma de rentas exentas y deducciones al 40 % de la renta líquida de la cédula general, sin pasar de 1.340 UVT ($ 66.730.660). Por fuera del tope van el 1 % de tus compras con factura electrónica (hasta 240 UVT) y 72 UVT por dependiente.',
    keywords: 'tope 40 límite 1340 casilla 92',
  },
  {
    id: 'dependents',
    category: 'Conceptos',
    question: '¿Cómo cuentan mis dependientes?',
    answer:
      'Con uno o más restas el 10 % de tus ingresos laborales (hasta 384 UVT). Además, cada dependiente suma 72 UVT ($ 3.585.528), hasta 4, por fuera del tope del 40 % (casilla 139). Si eres asalariado, el mismo dependiente vale para las dos.',
    keywords: 'dependientes hijos casilla 138 casilla 139 casilla 39',
  },
  {
    id: 'withholding',
    category: 'Conceptos',
    question: '¿Qué es la retención en la fuente?',
    answer:
      'Es impuesto que te descontaron durante el año, por ejemplo de tu salario o de tus CDT. Se resta del impuesto de tu declaración (casilla 132).',
    keywords: 'retención fuente descuento casilla 132',
  },
  {
    id: 'advance',
    category: 'Conceptos',
    question: '¿Qué es el anticipo?',
    answer:
      'Un pago por adelantado del impuesto del año siguiente. Es el 25 %, 50 % o 75 % de tu impuesto según las veces que hayas declarado, menos tus retenciones del año; por eso muchas veces queda en $ 0.',
    keywords: 'anticipo año siguiente casilla 133',
  },
  {
    id: 'in-favor',
    category: 'Conceptos',
    question: '¿Qué hago con un saldo a favor?',
    answer:
      'Puedes pedirle a la DIAN que te lo devuelva después de presentar, o dejarlo para restarlo del impuesto de tu próxima declaración.',
    keywords: 'saldo a favor devolución compensación casilla 137',
  },
];

/** Lower case without accents, for searching. */
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** Questions whose text or keywords contain every word of the query. */
export const searchFaq = (query: string, items: readonly FaqItem[] = FAQ_ITEMS): FaqItem[] => {
  const words = normalize(query).split(/\s+/u).filter(Boolean);
  if (words.length === 0) return [...items];
  return items.filter(item => {
    const haystack = normalize(`${item.question} ${item.answer} ${item.keywords}`);
    return words.every(word => haystack.includes(word));
  });
};
