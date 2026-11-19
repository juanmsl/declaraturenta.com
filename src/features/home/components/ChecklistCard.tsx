import type { IconType } from 'react-icons';
import { LuDownload, LuFileText, LuHouse, LuLandmark, LuReceipt } from 'react-icons/lu';

import { Icon, Text } from '@/shared/ui';

const DOCUMENTS: { icon: IconType; label: string }[] = [
  { icon: LuFileText, label: 'Certificado de ingresos y retenciones (formulario 220)' },
  { icon: LuLandmark, label: 'Certificados bancarios y extractos a 31 de diciembre' },
  { icon: LuHouse, label: 'Certificado de intereses del crédito de vivienda' },
  { icon: LuReceipt, label: 'Pagos de medicina prepagada y aportes voluntarios' },
  { icon: LuDownload, label: 'Reporte de información exógena de la DIAN' },
];

/** "Ten a mano": documents to gather before starting. */
export const ChecklistCard = () => (
  <section
    aria-labelledby='checklist-title'
    className='flex flex-col gap-3 rounded-lg border border-line bg-surface p-6'
  >
    <Text id='checklist-title' variant='title-s' as='h2'>
      Ten a mano
    </Text>
    <ul className='flex flex-col gap-3'>
      {DOCUMENTS.map(({ icon, label }) => (
        <li key={label} className='flex items-start gap-3'>
          <Icon icon={icon} size={18} className='mt-0.5 text-fg-action' />
          <Text variant='body-m' as='span' className='flex-1 text-fg-secondary'>
            {label}
          </Text>
        </li>
      ))}
    </ul>
  </section>
);
