import { render, screen } from '@testing-library/react';

import type { Form210Box } from '@/domain/form-210';

import { BoxField } from './BoxField';

const box = (number: number, kind: Form210Box['kind']): Form210Box => ({
  number,
  label: `Casilla ${String(number)}`,
  officialTitle: `Casilla ${String(number)}`,
  value: 1_000_000,
  kind,
  verified: true,
});

const field = (number: number) => screen.getByLabelText(new RegExp(`^Casilla ${String(number)},`));

describe('BoxField', () => {
  it('outlines calculated boxes in the action color', () => {
    render(<BoxField box={box(31, 'calculated')} />);
    expect(field(31)).toHaveClass('border-line-action', 'bg-rail');
  });

  it('shows the amount to pay in coral and the balance in favor in mint', () => {
    render(
      <>
        <BoxField box={box(136, 'highlighted')} />
        <BoxField box={box(137, 'highlighted')} />
      </>,
    );
    expect(field(136)).toHaveClass('border-line-error', 'bg-coral-soft');
    expect(field(137)).toHaveClass('border-line-success', 'bg-mint-soft');
  });
});
