import { Select } from 'polpo/components';

type SelectFieldProps<T extends string> = {
  name: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

/** Single choice from a short list, with the Figma field style, built on Polpo Select. */
export const SelectField = <T extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) => {
  const labels = options.map(option => option.label);
  const selected = options.find(option => option.value === value)?.label ?? null;

  return (
    <div className='text-field flex flex-col gap-2'>
      <Select<string>
        name={name}
        label={label}
        options={labels}
        value={selected}
        setValue={(next: string | null) => {
          const option = options.find(item => item.label === next);
          if (option) onChange(option.value);
        }}
        emptyMessage='No hay opciones'
      />
    </div>
  );
};
