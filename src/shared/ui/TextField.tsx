import { LuCircleX } from 'react-icons/lu';
import { Input } from 'polpo/components';
import { cn } from 'polpo/helpers';

import { Icon } from './Icon';
import { Text } from './Text';

type TextFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
};

/** Text input with the Figma field style, built on Polpo Input. */
export const TextField = ({ name, label, value, onChange, placeholder, hint, error }: TextFieldProps) => (
  <div className={cn('text-field flex flex-col gap-2', error && 'has-error')}>
    <Input name={name} label={label} value={value} setValue={onChange} placeholder={placeholder} />
    {error ? (
      <div className='flex items-center gap-1.5 text-fg-error' role='alert'>
        <Icon icon={LuCircleX} size={16} />
        <Text variant='note' className='text-fg-error'>
          {error}
        </Text>
      </div>
    ) : (
      hint && (
        <Text variant='note' className='text-fg-muted'>
          {hint}
        </Text>
      )
    )}
  </div>
);
