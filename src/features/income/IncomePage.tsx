import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { FLOW_STEPS } from '@/app/flow';
import type { DeclarationData } from '@/domain/declaration';
import { EstimatePanel } from '@/features/estimate/EstimatePanel';
import { reportedTotal } from '@/domain/exogenous';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { detectZeroSlip } from '@/shared/lib/zero-slip';
import { Button, CalcRow, Chip, MoneyField, OptionCard, StepHeader, StepLayout, Text } from '@/shared/ui';

import { TaxRows } from '@/features/estimate/TaxRows';

import { FeesSection } from './FeesSection';
import { ADJUSTMENT, EXOGENOUS_ORIGIN, isFromExogenous, totalOf, withTotal } from './income-concepts';
import { OtherSchedulesSection } from './OtherSchedulesSection';

const [, exogenousStep, , assetsStep] = FLOW_STEPS;
/** Screen 04 · Ingresos (Figma node 9:783). */
export const IncomePage = () => {
  const { taxYear } = useTaxYear();
  const inflationPercent = formatNumber(taxYear.general.inflationComponentRate * 100);
  const navigate = useNavigate();
  const { state, dispatch, result } = useDeclaration();
  const { labor, capital, nonLabor } = state.data;
  const { capital: capitalResult } = result;
  const capitalTotal = totalOf(capital.concepts);
  const nonLaborTotal = totalOf(nonLabor.concepts);

  const reportedSalaries = totalOf(labor.concepts);
  const employer = labor.concepts[0]?.entity;
  const salariesFromExogenous = labor.concepts.length > 0 && labor.salaries === reportedSalaries;
  const contributionsFromExogenous =
    labor.concepts.length > 0 &&
    labor.nonTaxableIncome === reportedTotal(state.exogenous.report, 'labor-non-taxable');
  const salarySlip = labor.concepts.length > 0 ? detectZeroSlip(labor.salaries, reportedSalaries) : null;

  const updateLabor = (patch: Partial<DeclarationData['labor']>) => {
    dispatch({ type: 'updateData', update: data => ({ ...data, labor: { ...data.labor, ...patch } }) });
  };

  const handleContinue = () => {
    dispatch({ type: 'completeStep', step: 'income' });
    void navigate(assetsStep.path);
  };

  return (
    <StepLayout aside={<IncomeEstimate />} className='gap-7 py-11'>
      <StepHeader
        title={`¿Cuánto recibiste por tu trabajo en ${taxYear.year}?`}
        badge={<Chip variant='box'>Casilla 32</Chip>}
        description={
          employer
            ? `Son tus rentas de trabajo como persona empleada. Prellenamos con lo que reportó ${employer}; corrige si tu certificado dice otra cosa.`
            : 'Son tus rentas de trabajo como persona empleada. Escribe lo que dice tu certificado de ingresos y retenciones.'
        }
      />

      <MoneyField
        name='salaries'
        label='Salarios y pagos laborales'
        value={labor.salaries}
        onChange={salaries => {
          updateLabor({ salaries });
        }}
        origin={salariesFromExogenous ? EXOGENOUS_ORIGIN : undefined}
        hint={
          salariesFromExogenous
            ? 'Tomado de lo que tu empleador reportó a la DIAN. Puedes corregirlo.'
            : 'Suma lo que aparece en tus certificados de ingresos y retenciones.'
        }
        error={
          salarySlip
            ? `Tu empleador reportó ${formatCurrency(reportedSalaries)}. Revisa si te ${salarySlip === 'missing' ? 'faltó' : 'sobró'} un cero.`
            : undefined
        }
      />
      <MoneyField
        name='nonTaxableIncome'
        label='Aportes obligatorios a pensión, salud y fondo de solidaridad'
        value={labor.nonTaxableIncome}
        onChange={nonTaxableIncome => {
          updateLabor({ nonTaxableIncome });
        }}
        origin={contributionsFromExogenous ? EXOGENOUS_ORIGIN : undefined}
        hint='No pagan impuesto. Los restamos antes de calcular.'
      />
      <MoneyField
        name='otherPayments'
        label='Otros pagos laborales no incluidos en el certificado'
        value={labor.otherPayments}
        onChange={otherPayments => {
          updateLabor({ otherPayments });
        }}
        hint='Por ejemplo, una bonificación de otro empleador. Si no tuviste, déjalo en 0.'
      />

      <div className='flex flex-col gap-1'>
        <Text variant='title-s' as='h2'>
          Rendimientos financieros y otros ingresos
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          También cuentan los intereses de tus cuentas e inversiones y otros pagos que recibiste. Si no
          tuviste, déjalos en 0.
        </Text>
      </div>
      <MoneyField
        name='capitalIncome'
        label='Intereses y rendimientos financieros (casilla 58)'
        value={capitalTotal}
        onChange={total => {
          dispatch({
            type: 'updateData',
            update: data => ({
              ...data,
              capital: {
                ...data.capital,
                concepts: withTotal(data.capital.concepts, total, { ...ADJUSTMENT, financial: true }),
              },
            }),
          });
        }}
        origin={isFromExogenous(capital.concepts) ? EXOGENOUS_ORIGIN : undefined}
        hint={
          capitalResult.inflationComponent > 0
            ? `Cuentas, CDT y fondos de inversión. El ${inflationPercent} % no es renta: restamos ${formatCurrency(capitalResult.inflationComponent)} por ti (casilla 59).`
            : `Cuentas, CDT y fondos de inversión. El ${inflationPercent} % no es renta; lo restamos por ti.`
        }
      />
      <MoneyField
        name='nonLaborIncome'
        label='Otros ingresos (casilla 74)'
        value={nonLaborTotal}
        onChange={total => {
          dispatch({
            type: 'updateData',
            update: data => ({
              ...data,
              nonLabor: { ...data.nonLabor, concepts: withTotal(data.nonLabor.concepts, total, ADJUSTMENT) },
            }),
          });
        }}
        origin={isFromExogenous(nonLabor.concepts) ? EXOGENOUS_ORIGIN : undefined}
        hint='Pagos que no vienen de tu trabajo ni de tus inversiones, por ejemplo reintegros o incentivos de comercios.'
      />

      <Text id='independent-question' variant='title-s' as='h2'>
        ¿Tuviste también ingresos como independiente?
      </Text>
      <div role='radiogroup' aria-labelledby='independent-question' className='flex items-start gap-3'>
        <OptionCard
          name='hasIndependentIncome'
          value='no'
          selectedValue={labor.hasIndependentIncome === null ? '' : labor.hasIndependentIncome ? 'yes' : 'no'}
          onSelect={() => {
            updateLabor({ hasIndependentIncome: false });
          }}
          title='No, solo tuve empleo'
          description='No te preguntamos por honorarios.'
        />
        <OptionCard
          name='hasIndependentIncome'
          value='yes'
          selectedValue={labor.hasIndependentIncome === null ? '' : labor.hasIndependentIncome ? 'yes' : 'no'}
          onSelect={() => {
            updateLabor({ hasIndependentIncome: true });
          }}
          title='Sí, honorarios o servicios'
          description='Te preguntaremos por ellos ahora.'
        />
      </div>

      {labor.hasIndependentIncome && <FeesSection />}

      <OtherSchedulesSection />

      <div className='flex items-start justify-between'>
        <Button variant='ghost' onClick={() => void navigate(exogenousStep.path)}>
          Atrás
        </Button>
        <Button icon={LuArrowRight} onClick={handleContinue}>
          Guardar y seguir
        </Button>
      </div>
    </StepLayout>
  );
};

const IncomeEstimate = () => {
  const { estimate, estimateIncludesDeductions } = useDeclaration();
  const toPay = estimate.balance > 0;

  return (
    <EstimatePanel
      showFiguresLink
      note={
        estimateIncludesDeductions
          ? 'Ya incluye tus deducciones.'
          : 'Aún faltan tus deducciones. Este valor suele bajar.'
      }
    >
      <CalcRow label='Ingresos brutos' value={estimate.generalGrossIncome} />
      <CalcRow
        variant='subtract'
        label='No constitutivos y costos'
        value={estimate.generalGrossIncome - estimate.generalNetIncome}
      />
      <CalcRow variant='subtotal' label='Renta líquida' value={estimate.generalNetIncome} />
      <CalcRow
        variant='subtract'
        label={estimateIncludesDeductions ? 'Deducciones y exentas' : 'Renta exenta del 25 % (tope 790 UVT)'}
        value={estimate.totalBenefits}
      />
      <TaxRows result={estimate} taxLabel='Impuesto según tabla' />
      <CalcRow variant='subtract' label='Retenciones que ya te hicieron' value={estimate.withholdings} />
      <CalcRow
        variant='total'
        label={toPay ? 'Saldo a pagar' : 'Saldo a favor'}
        value={toPay ? estimate.amountToPay : estimate.amountInFavor}
      />
    </EstimatePanel>
  );
};
