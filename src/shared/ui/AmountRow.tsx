import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

import { Chip } from './Chip';
import { Icon } from './Icon';
import { InlineMoneyField } from './MoneyField';
import { Text } from './Text';

type AmountRowProps = {
  icon: IconType;
  /** Name of the value; also the accessible name of its amount. */
  label: string;
  /** Second line: what the value is or what it is used for. */
  detail: ReactNode;
  name: string;
  value: number;
  onChange: (value: number) => void;
  /** Origin chip, e.g. «Desde exógena»; omitted when the value was changed. */
  origin?: string;
  /** Extra content under the second line, e.g. a question about the value. */
  children?: ReactNode;
};

/**
 * Row of an amount list (Figma 03c, «Tus movimientos» and «Tu declaración del año pasado»): icon,
 * name, second line, origin chip and the amount edited in the row. Goes inside `AmountList`.
 */
export const AmountRow = ({
  icon,
  label,
  detail,
  name,
  value,
  onChange,
  origin,
  children,
}: AmountRowProps) => (
  <li className='flex items-center gap-3.5 border-b border-line py-2.5 last:border-b-0'>
    <Icon icon={icon} size={20} className='text-fg-secondary' />
    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
      <Text variant='body-m-strong'>{label}</Text>
      <Text variant='note' className='text-fg-muted'>
        {detail}
      </Text>
      {children}
    </div>
    {origin && <Chip variant='exogenous'>{origin}</Chip>}
    <InlineMoneyField name={name} label={label} value={value} onChange={onChange} />
  </li>
);

/** Card that holds `AmountRow`s, like the exogenous report's sections. */
export const AmountList = ({ children }: { children: ReactNode }) => (
  <ul className='flex flex-col rounded-lg border border-line bg-surface px-5'>{children}</ul>
);
