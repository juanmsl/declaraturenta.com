import { Link } from 'react-router';
import { LuCalendar } from 'react-icons/lu';

import { TAX_YEAR } from '@/domain/uvt';
import { getInitials } from '@/domain/taxpayer';
import { sampleTaxpayer } from '@/mocks/sample-taxpayer';
import { formatLongDate } from '@/shared/lib/format';
import { Icon, Logo, Text } from '@/shared/ui';

import { SideRailItem } from './SideRailItem';
import type { StepProgress } from './useFlowProgress';

type SideRailProps = {
  steps: StepProgress[];
};

/** Figma "Riel lateral": brand, tax year, sections of the 210, deadline and user. */
export const SideRail = ({ steps }: SideRailProps) => {
  const taxpayer = sampleTaxpayer;

  return (
    <aside className='sticky top-0 flex h-dvh w-70 shrink-0 flex-col gap-7 overflow-y-auto border-r border-line bg-rail px-6 pt-7 pb-6'>
      <Link
        to='/'
        className='flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-line-action'
      >
        <Logo version='isotype' size={28} decorative />
        <Text as='span' variant='title-m'>
          Declara tu renta
        </Text>
      </Link>

      <div className='flex w-fit items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-3 pl-2.5'>
        <Icon icon={LuCalendar} size={14} className='text-fg-action' />
        <Text variant='caption' className='text-fg-secondary'>
          Año gravable {TAX_YEAR}
        </Text>
      </div>

      <nav aria-label='Secciones de la declaración'>
        <ul className='flex flex-col gap-1'>
          {steps.map(step => (
            <li key={step.id}>
              <SideRailItem to={step.path} label={step.railLabel} state={step.state} />
            </li>
          ))}
        </ul>
      </nav>

      <div className='flex-1' />

      <section className='flex flex-col gap-1 rounded-lg border border-line bg-surface p-4'>
        <div className='flex items-center gap-2'>
          <Icon icon={LuCalendar} size={16} className='text-fg-warning' />
          <Text variant='note' className='text-fg-secondary'>
            Tu fecha límite
          </Text>
        </div>
        <Text variant='body-m-strong'>{formatLongDate(taxpayer.filingDeadline)}</Text>
        <Text variant='note' className='text-fg-muted'>
          NIT terminado en {taxpayer.nitLastDigits}
        </Text>
      </section>

      <div className='flex items-center gap-2.5'>
        <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-sun' aria-hidden>
          <Text as='span' variant='caption'>
            {getInitials(taxpayer.fullName)}
          </Text>
        </div>
        <div className='flex flex-col'>
          <Text variant='caption'>{taxpayer.fullName}</Text>
          {taxpayer.isSample && (
            <Text variant='note' className='text-fg-muted'>
              Datos de ejemplo
            </Text>
          )}
        </div>
      </div>
    </aside>
  );
};
