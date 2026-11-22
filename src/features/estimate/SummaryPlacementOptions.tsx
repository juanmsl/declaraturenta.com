import { OptionCard, Text } from '@/shared/ui';

import { SUMMARY_PLACEMENTS, useSummaryPlacement } from './summary-placement';
import type { SummaryPlacement } from './summary-placement';

type SummaryPlacementOptionsProps = {
  /** Called after a new choice, e.g. to close the sheet. */
  onChange?: () => void;
  /** Shows «Mostrar el resumen» above the options. */
  showLabel?: boolean;
};

/** «Mostrar el resumen» (Figma M04c): where phones and tablets show the estimate (ADR 0060). */
export const SummaryPlacementOptions = ({ onChange, showLabel = true }: SummaryPlacementOptionsProps) => {
  const [placement, setPlacement] = useSummaryPlacement();

  return (
    <fieldset className='m-0 flex flex-col gap-3 border-0 p-0'>
      <legend className={showLabel ? 'mb-3 p-0' : 'sr-only'}>
        <Text as='span' variant='caption' className='text-fg-secondary'>
          Mostrar el resumen
        </Text>
      </legend>
      {SUMMARY_PLACEMENTS.map(option => (
        <OptionCard
          key={option.value}
          name='summary-placement'
          value={option.value}
          selectedValue={placement}
          onSelect={value => {
            setPlacement(value as SummaryPlacement);
            onChange?.();
          }}
          title={option.title}
          description={option.description}
        />
      ))}
    </fieldset>
  );
};
