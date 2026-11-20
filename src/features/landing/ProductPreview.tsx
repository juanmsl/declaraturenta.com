import { LuCircleCheck } from 'react-icons/lu';

import { Diamond, Icon, Logo, Text } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/format';

const RAIL = [
  'Importar exógena',
  'Ingresos',
  'Patrimonio',
  'Deducciones',
  'Otros ajustes',
  'Resultado',
  'Borrador 210',
];

const ROWS: { label: string; value: number; strong?: boolean; minus?: boolean }[] = [
  { label: 'Ingresos brutos', value: 180_000_000 },
  { label: 'No constitutivos y costos', value: 16_200_000, minus: true },
  { label: 'Renta líquida', value: 163_800_000, strong: true },
  { label: 'Deducciones y exentas', value: 69_105_528, minus: true },
  { label: 'Renta líquida gravable', value: 94_694_472, strong: true },
  { label: 'Impuesto sobre la renta', value: 8_587_000 },
  { label: 'Retenciones en la fuente', value: 11_240_000, minus: true },
];

/**
 * Small, decorative picture of the Resultado screen for the landing hero (Figma 18 «Vista de la
 * plataforma»), with the fictional sample figures. Hidden from assistive tech.
 */
export const ProductPreview = () => (
  <div
    aria-hidden
    className='flex w-158 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas shadow-[0_24px_48px_-24px_rgb(30_27_46/0.25)]'
  >
    <div className='flex w-31 shrink-0 flex-col gap-3 border-r border-line bg-rail px-2.5 py-3.5'>
      <Logo size={14} wordmarkVariant='title-s' decorative className='origin-left scale-75' />
      <ul className='flex flex-col gap-1.5'>
        {RAIL.map((label, index) => (
          <li
            key={label}
            className={`flex items-center gap-1.5 rounded-sm px-1.5 py-1 ${index === 5 ? 'bg-surface' : ''}`}
          >
            <Diamond size={8} state={index < 5 ? 'done' : index === 5 ? 'current' : 'pending'} />
            <span className='text-[9px] leading-3 text-fg-secondary'>{label}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className='flex min-w-0 flex-1 flex-col gap-3 p-4'>
      <div className='flex flex-col gap-1 rounded-md bg-mint-soft p-4'>
        <span className='flex items-center gap-1 text-[10px] font-medium text-fg-success'>
          <Icon icon={LuCircleCheck} size={11} />
          Tienes saldo a favor
        </span>
        <Text variant='figure-xl' as='span'>
          {formatCurrency(2_653_000)}
        </Text>
        <span className='text-[10px] leading-3.5 text-fg-secondary'>
          Te retuvieron más de lo que te corresponde pagar.
        </span>
      </div>
      <div className='flex flex-col rounded-md border border-line bg-surface px-3 py-2.5'>
        <span className='pb-1.5 text-[11px] font-semibold text-fg'>Cómo llegamos aquí</span>
        {ROWS.map(row => (
          <div
            key={row.label}
            className={`flex justify-between py-1 text-[9.5px] leading-3 ${row.strong ? 'border-t border-line font-semibold text-fg' : 'text-fg-secondary'}`}
          >
            <span>{row.label}</span>
            <span className='tabular-nums'>
              {row.minus ? '− ' : ''}
              {formatCurrency(row.value)}
            </span>
          </div>
        ))}
        <div className='flex items-center justify-between border-t border-line pt-1.5'>
          <span className='text-[10px] font-semibold text-fg'>Saldo a favor</span>
          <span className='text-sm font-bold text-fg tabular-nums'>{formatCurrency(2_653_000)}</span>
        </div>
      </div>
    </div>
  </div>
);
