import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { FLOW_STEPS } from '@/app/flow';
import { INFLATION_COMPONENT_RATE } from '@/domain/declaration';
import type { DeclarationData, IncomeConcept } from '@/domain/declaration';
import { TAX_YEAR } from '@/domain/uvt';
import { EstimatePanel } from '@/features/estimate/EstimatePanel';
import { reportedTotal } from '@/domain/exogenous';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { detectZeroSlip } from '@/shared/lib/zero-slip';
import {
  Alert,
  Button,
  CalcRow,
  Chip,
  MoneyField,
  OptionCard,
  StepHeader,
  StepLayout,
  Text,
} from '@/shared/ui';

const [, exogenousStep, , assetsStep] = FLOW_STEPS;
const EXOGENOUS_ORIGIN = { variant: 'exogenous', label: 'Desde exógena' } as const;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const ADJUSTMENT_ID = 'income-adjustment';
const INFLATION_PERCENT = formatNumber(INFLATION_COMPONENT_RATE * 100);

/**
 * Sets the total of an income schedule. Reported concepts are kept; the difference with what the
 * user writes becomes one adjustment concept, so the 210 detail still shows where each peso comes from.
 */
const withTotal = (
  concepts: readonly IncomeConcept[],
  total: number,
  financial: boolean,
): IncomeConcept[] => {
  const kept = concepts.filter(concept => concept.id !== ADJUSTMENT_ID);
  const difference = total - sum(kept.map(concept => concept.amount));
  return difference === 0
    ? kept
    : [
        ...kept,
        {
          id: ADJUSTMENT_ID,
          label: 'Ajuste que escribiste en Ingresos',
          entity: 'Lo ingresaste tú',
          amount: difference,
          origin: 'user',
          ...(financial ? { financial: true } : {}),
        },
      ];
};

const isFromExogenous = (concepts: readonly IncomeConcept[]) =>
  concepts.length > 0 && concepts.every(concept => concept.origin === 'exogenous');

/** Screen 04 · Ingresos (Figma node 9:783). */
export const IncomePage = () => {
  const navigate = useNavigate();
  const { state, dispatch, result } = useDeclaration();
  const { labor, capital, nonLabor } = state.data;
  const { capital: capitalResult } = result;
  const capitalTotal = sum(capital.concepts.map(concept => concept.amount));
  const nonLaborTotal = sum(nonLabor.concepts.map(concept => concept.amount));

  const reportedSalaries = sum(labor.concepts.map(concept => concept.amount));
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
        title={`¿Cuánto recibiste por tu trabajo en ${TAX_YEAR}?`}
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
              capital: { ...data.capital, concepts: withTotal(data.capital.concepts, total, true) },
            }),
          });
        }}
        origin={isFromExogenous(capital.concepts) ? EXOGENOUS_ORIGIN : undefined}
        hint={
          capitalResult.inflationComponent > 0
            ? `Cuentas, CDT y fondos de inversión. El ${INFLATION_PERCENT} % no es renta: restamos ${formatCurrency(capitalResult.inflationComponent)} por ti (casilla 59).`
            : `Cuentas, CDT y fondos de inversión. El ${INFLATION_PERCENT} % no es renta; lo restamos por ti.`
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
              nonLabor: { ...data.nonLabor, concepts: withTotal(data.nonLabor.concepts, total, false) },
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
          description='Seguimos con tu patrimonio.'
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

      {labor.hasIndependentIncome && (
        <Alert variant='info' title='Aún no calculamos honorarios'>
          Pronto podrás declarar aquí tus ingresos como independiente. Por ahora tu cálculo incluye tus rentas
          de trabajo como persona empleada, tus rendimientos financieros y tus otros ingresos.
        </Alert>
      )}

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
      <CalcRow label='Ingresos brutos' value={estimate.grossIncome} />
      <CalcRow
        variant='subtract'
        label='No constitutivos de renta'
        value={estimate.grossIncome - estimate.generalNetIncome}
      />
      <CalcRow variant='subtotal' label='Renta líquida' value={estimate.generalNetIncome} />
      <CalcRow
        variant='subtract'
        label={estimateIncludesDeductions ? 'Deducciones y exentas' : 'Renta exenta del 25 % (tope 790 UVT)'}
        value={estimate.totalBenefits}
      />
      <CalcRow variant='subtotal' label='Renta líquida gravable' value={estimate.taxableIncome} />
      <CalcRow label='Impuesto según tabla' value={estimate.netIncomeTax} />
      <CalcRow variant='subtract' label='Retenciones que ya te hicieron' value={estimate.withholdings} />
      <CalcRow
        variant='total'
        label={toPay ? 'Saldo a pagar' : 'Saldo a favor'}
        value={toPay ? estimate.amountToPay : estimate.amountInFavor}
      />
    </EstimatePanel>
  );
};
