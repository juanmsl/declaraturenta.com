import type { ReactNode } from 'react';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { formatNumber } from '@/shared/lib/format';
import { Button, CalcRow, Chip, Drawer, Text } from '@/shared/ui';

type FiguresDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WithBox = ({ label, box }: { label: ReactNode; box: number }) => (
  <span className='flex flex-wrap items-center gap-2'>
    {label}
    <Chip variant='box'>Casilla {box}</Chip>
  </span>
);

/** "¿De dónde sale cada cifra?": the estimate step by step, with the 210 box of each figure. */
export const FiguresDrawer = ({ isOpen, onClose }: FiguresDrawerProps) => {
  const { estimate, estimateIncludesDeductions } = useDeclaration();
  const { labor, tableTax } = estimate;
  const toPay = estimate.balance > 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title='¿De dónde sale cada cifra?'
      subtitle='Cálculo estimado con lo que has respondido hasta ahora'
      footer={
        <Button variant='ghost' onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <Text variant='body-m' className='text-fg-secondary'>
        Cada cifra corresponde a una casilla del Formulario 210. Las que restan aparecen con el signo menos.
        {estimateIncludesDeductions ? '' : ' Todavía no incluimos tus deducciones.'}
      </Text>
      <div className='flex flex-col'>
        <CalcRow label={<WithBox label='Ingresos brutos' box={32} />} value={estimate.grossLaborIncome} />
        <CalcRow
          variant='subtract'
          label={<WithBox label='No constitutivos de renta' box={33} />}
          value={labor.nonTaxableIncome}
        />
        <CalcRow
          variant='subtotal'
          label={<WithBox label='Renta líquida' box={34} />}
          value={labor.netIncome}
        />
        <CalcRow
          variant='subtract'
          label={<WithBox label='Rentas exentas' box={37} />}
          value={labor.totalExempt}
        />
        <CalcRow
          variant='subtract'
          label={<WithBox label='Deducciones' box={40} />}
          value={labor.totalDeductions}
        />
        <CalcRow label={<WithBox label='Exentas y deducciones' box={92} />} value={estimate.totalBenefits} />
        <CalcRow
          variant='subtotal'
          label={<WithBox label='Renta líquida gravable' box={97} />}
          value={estimate.taxableIncome}
        />
        <CalcRow label={<WithBox label='Impuesto según tabla' box={116} />} value={estimate.netIncomeTax} />
        <CalcRow
          variant='subtract'
          label={<WithBox label='Retenciones' box={132} />}
          value={estimate.withholdings}
        />
        <CalcRow
          variant='total'
          label={toPay ? 'Saldo a pagar' : 'Saldo a favor'}
          value={toPay ? estimate.amountToPay : estimate.amountInFavor}
        />
      </div>
      <Text variant='note' className='text-fg-muted'>
        El tope de exentas y deducciones es el menor entre el 40 % de tu renta líquida y 1.340 UVT. Tu renta
        gravable equivale a {formatNumber(tableTax.taxableUvt, 2)} UVT; la tabla del artículo 241 del Estatuto
        Tributario cobra {formatNumber(tableTax.bracket.rate * 100)} % sobre lo que pasa de{' '}
        {formatNumber(tableTax.bracket.fromUvt)} UVT
        {tableTax.bracket.fixedUvt > 0 ? `, más ${formatNumber(tableTax.bracket.fixedUvt)} UVT fijos` : ''}.
      </Text>
    </Drawer>
  );
};
