import { cn } from 'polpo/helpers';

import { formatCurrency } from '@/shared/lib/format';
import { Text } from '@/shared/ui';

export type CapSegment = {
  id: string;
  label: string;
  amount: number;
  /** Tailwind background class, matching the row marker. */
  colorClass: string;
};

type CapMeterProps = {
  segments: CapSegment[];
  cap: number;
  /** What the cap is, e.g. "40 % de tu renta líquida". */
  capDescription: string;
};

/**
 * "Tus beneficios frente al tope" (Figma screen 06): stacked benefits against the legal cap.
 * The bar spans the larger of the total and the cap; the part above the cap is hatched.
 */
export const CapMeter = ({ segments, cap, capDescription }: CapMeterProps) => {
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);
  const scale = Math.max(total, cap, 1);
  const excess = Math.max(0, total - cap);
  const capPercent = (cap / scale) * 100;
  const visible = segments.filter(segment => segment.amount > 0);

  return (
    <section className='flex flex-col gap-3 rounded-lg border border-line bg-surface p-5'>
      <div className='flex items-center gap-2 max-md:flex-col max-md:items-start max-md:gap-1'>
        <Text variant='title-s' as='h2' className='flex-1'>
          Tus beneficios frente al tope
        </Text>
        <Text variant='figure-m' className={excess > 0 ? 'text-fg-warning' : 'text-fg-success'}>
          {formatCurrency(total)} de {formatCurrency(cap)}
        </Text>
      </div>

      <div
        className='relative h-9'
        role='img'
        aria-label={`Beneficios por ${formatCurrency(total)} frente a un tope de ${formatCurrency(cap)}`}
      >
        <div className='absolute inset-x-0 top-2.5 flex h-4 gap-0.5'>
          {visible.map((segment, index) => (
            <div
              key={segment.id}
              title={`${segment.label}: ${formatCurrency(segment.amount)}`}
              className={cn(
                'h-full rounded-xs',
                segment.colorClass,
                index === 0 && 'rounded-l-lg',
                index === visible.length - 1 && excess === 0 && 'rounded-r-lg',
                index === visible.length - 1 && excess > 0 && 'rounded-r-lg',
              )}
              style={{ width: `${(segment.amount / scale) * 100}%` }}
            />
          ))}
        </div>
        {excess > 0 && (
          <div
            className='absolute top-2.5 right-0 h-4 rounded-r-lg bg-white/55 bg-[repeating-linear-gradient(-45deg,var(--color-coral)_0_1.5px,transparent_1.5px_6px)]'
            style={{ left: `${capPercent}%` }}
          />
        )}
        <div className='absolute top-0 h-9 w-0.5 bg-coral' style={{ left: `calc(${capPercent}% - 1px)` }} />
      </div>

      <div className='flex items-center gap-2 max-md:flex-col max-md:items-start max-md:gap-1'>
        <Text variant='note' className='flex-1 text-fg-secondary'>
          Tope legal: {formatCurrency(cap)} ({capDescription})
        </Text>
        {excess > 0 && (
          <Text variant='note' className='text-fg-error'>
            Excedente: {formatCurrency(excess)}
          </Text>
        )}
      </div>
    </section>
  );
};
