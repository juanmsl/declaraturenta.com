import type { IconType } from 'react-icons';
import {
  LuBriefcase,
  LuDownload,
  LuFileText,
  LuHouse,
  LuLandmark,
  LuLock,
  LuReceipt,
  LuScale,
  LuWallet,
} from 'react-icons/lu';

/** Texts of the landing page (Figma 18). */

export const HOW_STEPS: readonly { title: string; text: string }[] = [
  {
    title: 'Sube tu exógena',
    text: 'Descargas el Excel de información exógena del portal de la DIAN. Lo leemos en tu navegador y llevamos cada dato a su casilla.',
  },
  {
    title: 'Completa lo que falta',
    text: 'Ingresos, patrimonio y deducciones con preguntas simples. Si no tienes la exógena, lo llenas a mano.',
  },
  {
    title: 'Revisa cada cifra',
    text: 'Ingresos, patrimonio y deducciones con su casilla, su tope y de dónde sale. Corriges lo que no cuadre.',
  },
  {
    title: 'Transcribe tu 210',
    text: 'Descargas tu borrador y lo pasas al portal de la DIAN, donde lo firmas y presentas.',
  },
];

export const COVERAGE: readonly { icon: IconType; title: string; text: string }[] = [
  {
    icon: LuBriefcase,
    title: 'Trabajo y honorarios',
    text: 'Salarios, prestaciones y honorarios, con la opción de restar costos o tomar el 25 % exento.',
  },
  {
    icon: LuWallet,
    title: 'Rendimientos y otros ingresos',
    text: 'Intereses, CDT y fondos, sin el componente inflacionario que no es renta.',
  },
  {
    icon: LuScale,
    title: 'Pensiones y dividendos',
    text: 'La parte exenta de tu pensión y cada dividendo según el certificado de la empresa.',
  },
  {
    icon: LuHouse,
    title: 'Patrimonio y deudas',
    text: 'Inmuebles, cuentas, inversiones y vehículos al 31 de diciembre.',
  },
  {
    icon: LuReceipt,
    title: 'Deducciones y exentas',
    text: 'Vivienda, dependientes, medicina prepagada y aportes voluntarios, con el tope del 40 %.',
  },
  {
    icon: LuLandmark,
    title: 'Ganancias ocasionales',
    text: 'Herencias, donaciones, loterías y ventas de bienes, con su parte exenta.',
  },
];

export const DATA_POINTS: readonly { icon: IconType; title: string; text: string }[] = [
  { icon: LuLock, title: 'Sin cuentas', text: 'No te pedimos correo ni contraseña para usar la plataforma.' },
  {
    icon: LuFileText,
    title: 'Se guarda en tu equipo',
    text: 'Lo que respondes queda en este navegador. Tu exógena se lee aquí mismo y no se envía a ningún servidor.',
  },
  {
    icon: LuDownload,
    title: 'Una copia es tuya',
    text: 'Descarga una copia de tus datos y ábrela cuando quieras desde otro computador.',
  },
];

export const LANDING_FAQ: readonly { question: string; answer: string }[] = [
  {
    question: '¿Declara tu renta presenta mi declaración ante la DIAN?',
    answer:
      'No. Te entregamos un borrador del Formulario 210 casilla por casilla. Tú lo transcribes en el portal de la DIAN, donde lo firmas y presentas.',
  },
  {
    question: '¿Necesito saber de impuestos?',
    answer:
      'No. Te preguntamos en lenguaje simple y te explicamos cada cifra: de dónde sale, qué casilla llena y qué tope se aplicó.',
  },
  {
    question: '¿Es asesoría tributaria?',
    answer:
      'No. Calculamos con las reglas del instructivo de la DIAN, pero la plataforma no reemplaza la asesoría de un contador. Si tu caso es complejo, consulta a un profesional antes de presentar.',
  },
  {
    question: '¿Qué pasa si mi caso es muy particular?',
    answer:
      'En la ayuda de la plataforma te contamos qué no calculamos todavía. Si tienes ingresos del exterior, pérdidas de años anteriores u otra situación poco común, revisa tu borrador con un contador.',
  },
];
