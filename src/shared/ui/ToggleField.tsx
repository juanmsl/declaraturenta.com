import { useId } from 'react';
import type { ReactNode } from 'react';
import { Switch } from 'polpo/components';

import { Text } from './Text';

type ToggleFieldProps = {
  name: string;
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Yes/no setting with a Polpo Switch styled as the Figma "Interruptor". */
export const ToggleField = ({ name, label, description, checked, onChange }: ToggleFieldProps) => {
  const descriptionId = useId();

  return (
    <div className='toggle-field flex items-start gap-4 rounded-md border border-line bg-surface p-4'>
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <Text variant='body-m-strong'>{label}</Text>
        {description && (
          <Text id={descriptionId} variant='note' className='text-fg-muted'>
            {description}
          </Text>
        )}
      </div>
      <Switch name={name} value={checked} setValue={onChange} />
    </div>
  );
};
