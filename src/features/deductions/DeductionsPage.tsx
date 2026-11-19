import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { FLOW_STEPS } from '@/app/flow';
import { computeDeclaration } from '@/domain/declaration';
import { BENEFITS_CAP_RATE, LABOR_LIMITS_UVT } from '@/domain/labor-income';
import { uvtToPesos } from '@/domain/uvt';
import { EstimatePanel } from '@/features/estimate/EstimatePanel';
import { sampleExogenous } from '@/mocks/sample-exogenous';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Alert, Button, CalcRow, Chip, StepHeader, StepLayout, Text } from '@/shared/ui';

import { CapMeter } from './CapMeter';
import type { CapSegment } from './CapMeter';
import { DeductionDrawer } from './DeductionDrawer';
import type { DeductionId } from './DeductionDrawer';

const [, , , assetsStep, , resultStep] = FLOW_STEPS;

type Origin = 'exogenous' | 'calculated' | 'user';

const ORIGIN_CHIPS: Record<Origin, { variant: 'exogenous' | 'box'; label: string }> = {
  exogenous: { variant: 'exogenous', label: 'Desde exógena' },
  calculated: { variant: 'box', label: 'Calculado' },
  user: { variant: 'box', label: 'Lo ingresaste tú' },
};

/** Screen 06 · Deducciones y exentas (Figma node 10:871). */
export const DeductionsPage = () => {
  const navigate = useNavigate();
  const { state, dispatch, result } = useDeclaration();
  const [editing, setEditing] = useState<DeductionId | null>(null);
  const { labor } = result;
  const { deductions } = state.data;
  const imported = state.exogenous.fileName !== null || state.data.labor.concepts.length > 0;

  const rows: (CapSegment & { id: DeductionId; note: string; origin: Origin })[] = [
    {
      id: 'housing',
      label: 'Intereses del crédito de vivienda',
      note: `Hasta ${formatNumber(LABOR_LIMITS_UVT.housingInterest)} UVT al año`,
      amount: labor.housingDeduction,
      colorClass: 'bg-action',
      origin:
        imported && deductions.housingInterestPaid === sampleExogenous.housingInterest.amount
          ? 'exogenous'
          : 'user',
    },
    {
      id: 'dependent',
      label: 'Dependiente económico',
      note:
        deductions.dependents > 0
          ? `${formatNumber(deductions.dependents)} ${deductions.dependents === 1 ? 'dependiente' : 'dependientes'} · 10 % de tus ingresos, hasta ${formatNumber(LABOR_LIMITS_UVT.dependent)} UVT`
          : 'No registraste dependientes',
      amount: labor.dependent,
      colorClass: 'bg-sun',
      origin: 'calculated',
    },
    {
      id: 'prepaid-health',
      label: 'Medicina prepagada',
      note: 'Hasta 16 UVT al mes',
      amount: labor.prepaidHealth,
      colorClass: 'bg-mint',
      origin:
        imported && deductions.prepaidHealthPaid === sampleExogenous.prepaidHealth.amount
          ? 'exogenous'
          : 'user',
    },
    {
      id: 'exempt-25',
      label: 'Renta exenta del 25 %',
      note: `Sobre lo que queda, hasta ${formatNumber(LABOR_LIMITS_UVT.exempt25)} UVT`,
      amount: labor.exempt25,
      colorClass: 'bg-ink',
      origin: 'calculated',
    },
  ];

  const capByPercent =
    Math.round(labor.netIncome * BENEFITS_CAP_RATE) <= uvtToPesos(LABOR_LIMITS_UVT.benefitsCap);

  const handleContinue = () => {
    dispatch({ type: 'completeStep', step: 'deductions' });
    void navigate(resultStep.path);
  };

  return (
    <StepLayout aside={<DeductionsEstimate />} className='gap-6 py-11'>
      <StepHeader
        title='Lo que la ley te deja restar'
        description={`Deducciones y rentas exentas bajan la base de tu impuesto. Juntas tienen un tope: el 40 % de tu renta líquida, sin pasar de ${formatNumber(LABOR_LIMITS_UVT.benefitsCap)} UVT.`}
      />

      <ul className='flex flex-col rounded-lg border border-line bg-surface px-5'>
        {rows.map(row => (
          <li key={row.id} className='border-b border-line last:border-b-0'>
            <button
              type='button'
              onClick={() => {
                setEditing(row.id);
              }}
              aria-label={`${row.id === 'exempt-25' ? 'Ver' : 'Editar'} ${row.label}`}
              className='-mx-5 flex w-[calc(100%+2.5rem)] cursor-pointer items-center gap-3.5 px-5 py-3.25 text-left transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none'
            >
              <span aria-hidden className={cn('size-3 shrink-0 rounded-[3px]', row.colorClass)} />
              <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <Text as='span' variant='body-m-strong'>
                  {row.label}
                </Text>
                <Text as='span' variant='note' className='text-fg-muted'>
                  {row.note}
                </Text>
              </span>
              <Chip variant={ORIGIN_CHIPS[row.origin].variant}>{ORIGIN_CHIPS[row.origin].label}</Chip>
              <Text as='span' variant='figure-m' className='w-32.5 shrink-0 text-right'>
                {formatCurrency(row.amount)}
              </Text>
            </button>
          </li>
        ))}
      </ul>

      <CapMeter
        segments={rows}
        cap={labor.benefitsCap}
        capDescription={
          capByPercent ? '40 % de tu renta líquida' : `${formatNumber(LABOR_LIMITS_UVT.benefitsCap)} UVT`
        }
      />

      {labor.benefitsExcess > 0 && (
        <Alert
          variant='warning'
          title={capByPercent ? 'Llegaste al tope del 40 %' : 'Llegaste al tope de 1.340 UVT'}
        >
          Restamos {formatCurrency(labor.cappedBenefits)}, el máximo que permite la ley. Los{' '}
          {formatCurrency(labor.benefitsExcess)} restantes no se pueden usar este año; no es un error tuyo.
        </Alert>
      )}

      <div className='flex items-start justify-between'>
        <Button variant='ghost' onClick={() => void navigate(assetsStep.path)}>
          Atrás
        </Button>
        <Button icon={LuArrowRight} onClick={handleContinue}>
          Ver mi resultado
        </Button>
      </div>

      <DeductionDrawer
        deduction={editing}
        onClose={() => {
          setEditing(null);
        }}
      />
    </StepLayout>
  );
};

const DeductionsEstimate = () => {
  const { state, estimate } = useDeclaration();
  const before = computeDeclaration(state.data, { includeDeductions: false });
  const toPay = estimate.balance > 0;

  let note: string;
  if (before.balance > 0 && !toPay) {
    note = `Con tus deducciones pasaste de pagar ${formatCurrency(before.amountToPay)} a tener saldo a favor.`;
  } else if (before.balance > 0) {
    note = `Con tus deducciones bajaste de ${formatCurrency(before.amountToPay)} a ${formatCurrency(estimate.amountToPay)}.`;
  } else {
    note = `Con tus deducciones tu saldo a favor pasó de ${formatCurrency(before.amountInFavor)} a ${formatCurrency(estimate.amountInFavor)}.`;
  }

  return (
    <EstimatePanel note={note}>
      <CalcRow variant='subtotal' label='Renta líquida' value={estimate.labor.netIncome} />
      <CalcRow variant='subtract' label='Exentas y deducciones' value={estimate.totalBenefits} />
      <CalcRow variant='subtotal' label='Renta líquida gravable' value={estimate.taxableIncome} />
      <CalcRow label='Impuesto según tabla' value={estimate.netIncomeTax} />
      <CalcRow variant='subtract' label='Retenciones' value={estimate.withholdings} />
      <CalcRow
        variant='total'
        label={toPay ? 'Saldo a pagar' : 'Saldo a favor'}
        value={toPay ? estimate.amountToPay : estimate.amountInFavor}
      />
    </EstimatePanel>
  );
};
