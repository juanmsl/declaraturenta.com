import type { ReactNode } from 'react';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { formatNumber } from '@/shared/lib/format';
import { Button, CalcRow, Chip, Drawer, Text } from '@/shared/ui';
import { TaxRows } from '@/features/estimate/TaxRows';

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
        <CalcRow
          label={<WithBox label='Ingresos por tu trabajo' box={32} />}
          value={estimate.grossLaborIncome}
        />
        {estimate.fees.grossIncome > 0 && (
          <CalcRow
            label={<WithBox label='Honorarios con costos' box={43} />}
            value={estimate.fees.grossIncome}
          />
        )}
        {estimate.capital.grossIncome > 0 && (
          <CalcRow
            label={<WithBox label='Rendimientos financieros' box={58} />}
            value={estimate.capital.grossIncome}
          />
        )}
        {estimate.nonLabor.grossIncome > 0 && (
          <CalcRow
            label={<WithBox label='Otros ingresos' box={74} />}
            value={estimate.nonLabor.grossIncome}
          />
        )}
        <CalcRow
          variant='subtract'
          label={<WithBox label='No constitutivos y costos' box={33} />}
          value={estimate.generalGrossIncome - estimate.generalNetIncome}
        />
        <CalcRow
          variant='subtotal'
          label={<WithBox label='Renta líquida' box={91} />}
          value={estimate.generalNetIncome}
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
        <TaxRows
          result={estimate}
          taxLabel='Impuesto según tabla'
          withBox={(label, box) => <WithBox label={label} box={box} />}
        />
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
        El tope de exentas y deducciones es el menor entre el 40 % de tus ingresos menos los no constitutivos
        y 1.340 UVT. La base de tu impuesto equivale a {formatNumber(tableTax.taxableUvt, 2)} UVT; la tabla
        del artículo 241 del Estatuto Tributario cobra {formatNumber(tableTax.bracket.rate * 100)} % sobre lo
        que pasa de {formatNumber(tableTax.bracket.fromUvt)} UVT
        {tableTax.bracket.fixedUvt > 0 ? `, más ${formatNumber(tableTax.bracket.fixedUvt)} UVT fijos` : ''}.
      </Text>
    </Drawer>
  );
};
