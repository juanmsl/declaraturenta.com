import { LuCalendar } from 'react-icons/lu';

import type { Taxpayer } from '@/domain/taxpayer';
import { formatLongDate } from '@/shared/lib/format';
import { Icon, Text } from '@/shared/ui';

type DeadlineCardProps = {
  taxpayer: Taxpayer;
};

/** "Tu fecha límite": deadline from the last two digits of the NIT. */
export const DeadlineCard = ({ taxpayer }: DeadlineCardProps) => (
  <section className='flex flex-col gap-1.5 rounded-lg bg-sun-soft p-6'>
    <div className='flex items-center gap-2'>
      <Icon icon={LuCalendar} size={18} className='text-fg-warning' />
      <Text variant='caption' className='text-fg-warning'>
        Tu fecha límite
      </Text>
    </div>
    <Text variant='title-l' as='p'>
      {formatLongDate(taxpayer.filingDeadline)}
    </Text>
    <Text variant='body-m' className='text-fg-secondary'>
      Según los dos últimos dígitos de tu NIT ({taxpayer.nitLastDigits}). Declarar tarde genera sanción e
      intereses.
    </Text>
  </section>
);
