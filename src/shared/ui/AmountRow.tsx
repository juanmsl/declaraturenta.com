import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

import { Chip } from './Chip';
import { Icon } from './Icon';
import { InlineMoneyField } from './MoneyField';
import { RowContent } from './RowContent';

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
  <li className='flex border-b border-line py-2.5 last:border-b-0 max-xl:py-3.5'>
    <RowContent
      icon={<Icon icon={icon} size={20} className='shrink-0 text-fg-secondary' />}
      title={label}
      detail={detail}
      badge={origin && <Chip variant='exogenous'>{origin}</Chip>}
      value={<InlineMoneyField name={name} label={label} value={value} onChange={onChange} />}
    >
      {children}
    </RowContent>
  </li>
);

/** Card that holds `AmountRow`s, like the exogenous report's sections. */
export const AmountList = ({ children }: { children: ReactNode }) => (
  <ul className='flex flex-col rounded-lg border border-line bg-surface px-5'>{children}</ul>
);
