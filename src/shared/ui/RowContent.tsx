import type { ReactNode } from 'react';

import { useIsCompact } from '@/shared/lib/use-compact';

import { Text } from './Text';

type RowContentProps = {
  /** Icon or mark at the start of the row. */
  icon?: ReactNode;
  title: ReactNode;
  /** Second line: what the value is, who reported it… */
  detail?: ReactNode;
  /** Origin or status chip. */
  badge?: ReactNode;
  /** The amount, read-only or editable. */
  value?: ReactNode;
  /** Extra content, e.g. a question about the value. */
  children?: ReactNode;
};

/**
 * Inside of a list row (amounts, holdings, benefits). On a computer: icon, name and second line,
 * chip and amount in one line. On phones and tablets: icon with the name, the second line, then
 * the chip and the amount, and the extra content last (Figma M03–M08, ADR 0060). Renders spans
 * so it also fits inside a button.
 */
export const RowContent = ({ icon, title, detail, badge, value, children }: RowContentProps) => {
  const isCompact = useIsCompact();
  const titleText = (
    <Text as='span' variant='body-m-strong' className='min-w-0'>
      {title}
    </Text>
  );
  const detailText = detail && (
    <Text as='span' variant='note' className='text-fg-muted'>
      {detail}
    </Text>
  );

  if (isCompact) {
    return (
      <span className='flex w-full min-w-0 flex-col gap-1.5'>
        <span className='flex items-center gap-2.5'>
          {icon}
          {titleText}
        </span>
        {detailText}
        {(Boolean(badge) || Boolean(value)) && (
          <span className='flex items-center justify-between gap-3 pt-0.5'>
            {badge ?? <span />}
            {value}
          </span>
        )}
        {children}
      </span>
    );
  }

  return (
    <span className='flex w-full min-w-0 items-center gap-3.5'>
      {icon}
      <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
        {titleText}
        {detailText}
        {children}
      </span>
      {badge}
      {value}
    </span>
  );
};
