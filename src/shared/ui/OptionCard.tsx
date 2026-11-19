import { Radio } from 'polpo/components';
import { cn } from 'polpo/helpers';

import { Text } from './Text';

type OptionCardProps = {
  name: string;
  value: string;
  selectedValue: string;
  onSelect: (value: string) => void;
  title: string;
  description?: string;
  className?: string;
};

/**
 * Single-choice answer for guided questions (Figma "Opción"). A Polpo Radio inside a card; the
 * whole card is the label, so clicking anywhere selects it.
 */
export const OptionCard = ({
  name,
  value,
  selectedValue,
  onSelect,
  title,
  description,
  className,
}: OptionCardProps) => {
  const isSelected = value === selectedValue;

  return (
    <label
      className={cn(
        'option-card m-0 flex min-w-0 flex-1 cursor-pointer items-start gap-3.5 rounded-lg px-4.5 py-4 transition-colors duration-150',
        'has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-line-action has-[input:focus-visible]:ring-offset-2',
        isSelected
          ? 'border-2 border-line-action bg-rail px-4 py-3.75'
          : 'border border-line bg-surface hover:border-line-strong',
        className,
      )}
    >
      <Radio name={name} radioValue={value} value={selectedValue} setValue={onSelect} />
      <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <Text as='span' variant='body-m-strong'>
          {title}
        </Text>
        {description && (
          <Text as='span' variant='note' className='text-fg-muted'>
            {description}
          </Text>
        )}
      </span>
    </label>
  );
};
