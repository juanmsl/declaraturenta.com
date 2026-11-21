import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { effectiveData } from '@/app/declaration/declaration-state';
import { getStep } from '@/app/flow';
import { computeDeclaration } from '@/domain/declaration';
import { uvtToPesos } from '@/domain/uvt';
import { EstimatePanel } from '@/features/estimate/EstimatePanel';
import { reportedTotal } from '@/domain/exogenous';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Alert, Button, CalcRow, Chip, StepHeader, StepLayout, Text } from '@/shared/ui';
import { TaxRows } from '@/features/estimate/TaxRows';

import { CapMeter } from './CapMeter';
import type { CapSegment } from './CapMeter';
import { DeductionDrawer } from './DeductionDrawer';
import type { DeductionId } from './DeductionDrawer';

const incomeStep = getStep('income');
const resultStep = getStep('adjustments');

type Origin = 'exogenous' | 'calculated' | 'user' | 'box123';

const ORIGIN_CHIPS: Record<Origin, { variant: 'exogenous' | 'box'; label: string }> = {
  exogenous: { variant: 'exogenous', label: 'Desde exógena' },
  calculated: { variant: 'box', label: 'Calculado' },
  user: { variant: 'box', label: 'Lo ingresaste tú' },
  box123: { variant: 'box', label: 'Casilla 123' },
};

/** Screen 06 · Deducciones y exentas (Figma node 10:871). */
export const DeductionsPage = () => {
  const { taxYear } = useTaxYear();
  const navigate = useNavigate();
  const { state, dispatch, result } = useDeclaration();
  const [editing, setEditing] = useState<DeductionId | null>(null);
  const { labor } = result;
  const { deductions } = state.data;
  const imported = state.exogenous.fileName !== null || state.data.labor.concepts.length > 0;

  const { detail } = result.benefits;
  const userOrigin = (amount: number): Origin | null => (amount > 0 ? 'user' : null);
  const fromReport = (amount: number, kind: Parameters<typeof reportedTotal>[1]): Origin | null =>
    imported && amount > 0 && amount === reportedTotal(state.exogenous.report, kind)
      ? 'exogenous'
      : userOrigin(amount);

  type Row = CapSegment & { id: DeductionId; note: string; origin: Origin | null; inCap: boolean };
  const rows: Row[] = [
    {
      id: 'housing',
      label: 'Intereses del crédito de vivienda',
      note: `Hasta ${formatNumber(taxYear.labor.housingInterestUvt)} UVT al año`,
      amount: detail.housingInterest,
      colorClass: 'bg-action',
      origin: fromReport(deductions.housingInterestPaid, 'housing-interest'),
      inCap: true,
    },
    {
      id: 'dependent',
      label: 'Dependiente económico',
      note:
        deductions.dependents > 0
          ? `${formatNumber(deductions.dependents)} ${deductions.dependents === 1 ? 'dependiente' : 'dependientes'} · 10 % de tus ingresos, hasta ${formatNumber(taxYear.labor.dependentUvt)} UVT`
          : 'No registraste dependientes',
      amount: labor.dependent,
      colorClass: 'bg-sun',
      origin: 'calculated',
      inCap: true,
    },
    {
      id: 'prepaid-health',
      label: 'Medicina prepagada',
      note: 'Hasta 16 UVT al mes',
      amount: labor.prepaidHealth,
      colorClass: 'bg-mint',
      origin: fromReport(deductions.prepaidHealthPaid, 'prepaid-health'),
      inCap: true,
    },
    {
      id: 'severance',
      label: 'Cesantías exentas',
      note:
        deductions.severanceReceived > 0
          ? `Salario promedio de 6 meses: ${formatNumber(Math.round(detail.severanceAverageSalary / taxYear.uvt))} UVT · exentas al ${String(Math.round(detail.severanceExemptShare * 100))} %`
          : 'Cesantías e intereses que recibiste en el año',
      amount: detail.severanceExempt,
      colorClass: 'bg-mint',
      origin: detail.severanceExempt > 0 ? 'calculated' : null,
      inCap: true,
    },
    {
      id: 'voluntary',
      label: 'Aportes voluntarios a pensión y AFC',
      note: `Hasta el ${String(Math.round(taxYear.benefits.voluntaryContributionsRate * 100))} % de tus ingresos y ${formatNumber(taxYear.benefits.voluntaryContributionsUvt)} UVT al año`,
      amount: detail.voluntaryContributionsAllowed,
      colorClass: 'bg-mint',
      origin: fromReport(state.data.labor.voluntaryContributions, 'voluntary-pension'),
      inCap: true,
    },
    {
      id: 'gmf',
      label: 'Gravamen a los movimientos financieros (4 × 1.000)',
      note: `El ${String(Math.round(taxYear.benefits.gmfRate * 100))} % de lo que te cobraron en el año`,
      amount: detail.gmf,
      colorClass: 'bg-mint',
      origin: userOrigin(detail.gmf),
      inCap: true,
    },
    {
      id: 'icetex',
      label: 'Intereses de crédito ICETEX',
      note: `Hasta ${formatNumber(taxYear.benefits.icetexInterestUvt)} UVT al año`,
      amount: detail.icetex,
      colorClass: 'bg-mint',
      origin: userOrigin(detail.icetex),
      inCap: true,
    },
    {
      id: 'independent-severance',
      label: 'Aportes a cesantías como independiente',
      note: `Hasta ${formatNumber(taxYear.benefits.independentSeveranceUvt)} UVT, sin pasar de 1/12 de tu ingreso gravable`,
      amount: detail.independentSeverance,
      colorClass: 'bg-mint',
      origin: userOrigin(detail.independentSeverance),
      inCap: true,
    },
    {
      id: 'other-exempt',
      label: 'Otras rentas exentas de tu trabajo',
      note: 'Indemnizaciones, maternidad o gastos de entierro',
      amount: detail.otherLaborExempt,
      colorClass: 'bg-mint',
      origin: userOrigin(detail.otherLaborExempt),
      inCap: true,
    },
    {
      id: 'exempt-25',
      label: 'Renta exenta del 25 %',
      note: `Sobre lo que queda, hasta ${formatNumber(taxYear.labor.exempt25Uvt)} UVT`,
      amount: labor.exempt25,
      colorClass: 'bg-ink',
      origin: 'calculated',
      inCap: true,
    },
    {
      id: 'unlimited-exempt',
      label: 'Rentas exentas sin el tope del 40 %',
      note: 'Comunidad Andina, convenios de doble tributación y art. 206 num. 5 a 8',
      amount: detail.unlimitedExempt,
      colorClass: 'bg-line-strong',
      origin: userOrigin(detail.unlimitedExempt),
      inCap: false,
    },
    {
      id: 'donations',
      label: 'Donaciones',
      note: `Restas el ${String(Math.round(taxYear.discounts.donationRate * 100))} % de lo donado de tu impuesto`,
      amount: result.donationsDiscount,
      colorClass: 'bg-line-strong',
      origin: result.donationsDiscount > 0 ? 'box123' : null,
      inCap: false,
    },
  ];

  const capByPercent =
    Math.round(result.benefitsCapBase * taxYear.general.benefitsCapRate) <=
    uvtToPesos(taxYear.general.benefitsCapUvt, taxYear);

  const handleContinue = () => {
    dispatch({ type: 'completeStep', step: 'deductions' });
    void navigate(resultStep.path);
  };

  return (
    <StepLayout aside={<DeductionsEstimate />} className='gap-6 py-11'>
      <StepHeader
        title='Lo que la ley te deja restar'
        description={`Deducciones y rentas exentas bajan la base de tu impuesto. Juntas tienen un tope: el 40 % de tus ingresos menos los no constitutivos, sin pasar de ${formatNumber(taxYear.general.benefitsCapUvt)} UVT.`}
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
              {row.origin && (
                <Chip variant={ORIGIN_CHIPS[row.origin].variant}>{ORIGIN_CHIPS[row.origin].label}</Chip>
              )}
              <Text as='span' variant='figure-m' className='w-32.5 shrink-0 text-right'>
                {formatCurrency(row.amount)}
              </Text>
            </button>
          </li>
        ))}
      </ul>

      <CapMeter
        segments={rows.filter(row => row.inCap)}
        cap={labor.benefitsCap}
        capDescription={
          capByPercent
            ? '40 % de tus ingresos menos los no constitutivos'
            : `${formatNumber(taxYear.general.benefitsCapUvt)} UVT`
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
        <Button variant='ghost' onClick={() => void navigate(incomeStep.path)}>
          Atrás
        </Button>
        <Button icon={LuArrowRight} onClick={handleContinue}>
          Seguir con otros ajustes
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
  const { taxYear } = useTaxYear();
  const before = computeDeclaration(effectiveData(state), {
    includeDeductions: false,
    taxYear,
    filingDeadline: state.taxpayer.filingDeadline,
  });
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
      <CalcRow variant='subtotal' label='Renta líquida' value={estimate.generalNetIncome} />
      <CalcRow variant='subtract' label='Exentas y deducciones' value={estimate.totalBenefits} />
      <TaxRows result={estimate} taxLabel='Impuesto según tabla' />
      <CalcRow variant='subtract' label='Retenciones' value={estimate.withholdings} />
      <CalcRow
        variant='total'
        label={toPay ? 'Saldo a pagar' : 'Saldo a favor'}
        value={toPay ? estimate.amountToPay : estimate.amountInFavor}
      />
    </EstimatePanel>
  );
};
