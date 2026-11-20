/**
 * Terms of use and privacy policy (Figma 16b and 16c). Drafts written for the proof of concept;
 * a lawyer should review them before the platform goes public.
 */

export type LegalSection = { title: string; text: string };

export const LEGAL_UPDATED_AT = '2026-11-19';

export const TERMS: readonly LegalSection[] = [
  {
    title: 'Qué es Declara tu renta',
    text: 'Declara tu renta es una herramienta web que te ayuda a preparar el borrador de tu declaración de renta en el Formulario 210 de la DIAN. No presenta tu declaración: tú la transcribes, firmas y presentas en el portal de la DIAN.',
  },
  {
    title: 'No somos la DIAN',
    text: 'No somos la Dirección de Impuestos y Aduanas Nacionales ni tenemos relación con ella. Los nombres de formularios, casillas y normas se citan solo para explicarte tu declaración.',
  },
  {
    title: 'No es asesoría tributaria',
    text: 'Calculamos con las reglas del instructivo oficial y te explicamos cada cifra, pero la información que ves no reemplaza la asesoría de un contador. Si tu caso es complejo o tienes dudas, consulta a un profesional antes de presentar.',
  },
  {
    title: 'Tu responsabilidad',
    text: 'Tú eres responsable de los datos que escribes, de revisarlos con tus certificados y de presentar tu declaración a tiempo. Lo que presentes ante la DIAN es tu declaración, aunque la hayas preparado con esta herramienta.',
  },
  {
    title: 'Plataforma en prueba',
    text: 'Declara tu renta está en desarrollo. Puede cambiar, tener errores o dejar de estar disponible. Haz tu propia revisión antes de usar cualquier cifra.',
  },
  {
    title: 'Responsabilidad',
    text: 'En la medida en que la ley lo permita, no respondemos por sanciones, intereses ni perjuicios que resulten de datos incompletos o equivocados, de errores de la herramienta o de decisiones tomadas con base en ella.',
  },
  {
    title: 'Cambios',
    text: 'Podemos actualizar estos términos. Publicaremos la versión vigente en esta página con su fecha.',
  },
  {
    title: 'Ley aplicable y contacto',
    text: 'Estos términos se rigen por las leyes de la República de Colombia. Escríbenos a juanmsl.pk@gmail.com.',
  },
];

export const PRIVACY: readonly LegalSection[] = [
  {
    title: 'Responsable',
    text: 'Juan Sánchez, persona natural, es responsable del tratamiento de datos de Declara tu renta. Contacto: juanmsl.pk@gmail.com. Esta política sigue la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
  },
  {
    title: 'Qué datos usamos',
    text: 'Los datos que escribes y los de tu reporte de información exógena: nombres, ingresos, patrimonio, deducciones y retenciones. Del documento de identidad solo conservamos los dos últimos dígitos, para calcular tu fecha límite.',
  },
  {
    title: 'Dónde quedan',
    text: 'Todo se procesa y se guarda en tu navegador, en este equipo. No recibimos ni guardamos tus datos en nuestros servidores. Si borras los datos del navegador o usas otro equipo, no los verás.',
  },
  {
    title: 'Para qué',
    text: 'Únicamente para calcular tu declaración, mostrarte de dónde sale cada cifra y generar tu borrador.',
  },
  {
    title: 'Copia de tus datos',
    text: 'Puedes descargar una copia en un archivo y abrirla después. Ese archivo queda en tu equipo; cuídalo como cualquier documento con información financiera.',
  },
  {
    title: 'Datos técnicos',
    text: 'Nuestro proveedor de alojamiento (Vercel) puede registrar datos técnicos de la conexión, como la dirección IP y el navegador, para operar el sitio. No usamos cookies de publicidad ni herramientas de analítica.',
  },
  {
    title: 'Tus derechos',
    text: 'Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar tu autorización, escribiéndonos al correo de contacto. Como tus datos están en tu navegador, también puedes borrarlos tú desde la plataforma o desde la configuración del navegador. Si no recibes respuesta, puedes acudir a la Superintendencia de Industria y Comercio.',
  },
  {
    title: 'Vigencia',
    text: 'Esta política rige desde su publicación. Si cambia, lo verás en esta página con su fecha.',
  },
];
