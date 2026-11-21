import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { getStep } from '@/app/flow';
import { EstimatePanel } from '@/features/estimate/EstimatePanel';
import { TaxRows } from '@/features/estimate/TaxRows';
import { Alert, Button, CalcRow, StepHeader, StepLayout } from '@/shared/ui';

import { AdjustmentsSections } from './AdjustmentsSections';

const deductionsStep = getStep('deductions');
const resultStep = getStep('result');

/** Screen 15 · Otros ajustes (Figma 95:11297): uncommon boxes behind a switch each (ADR 0038). */
export const AdjustmentsPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useDeclaration();

  const handleContinue = () => {
    dispatch({ type: 'completeStep', step: 'adjustments' });
    void navigate(resultStep.path);
  };

  return (
    <StepLayout aside={<AdjustmentsEstimate />}>
      <StepHeader
        title='¿Hay algo más que debas declarar?'
        description='Son casos poco comunes. Activa solo los que te apliquen; si ninguno aplica, sigue al resultado.'
      />

      <AdjustmentsSections />

      <Alert variant='info' title='Renta presuntiva: no tienes que hacer nada'>
        Desde 2021 su tarifa es 0 %, así que la casilla 98 queda en $ 0.
      </Alert>

      <div className='flex items-start justify-between'>
        <Button variant='ghost' onClick={() => void navigate(deductionsStep.path)}>
          Atrás
        </Button>
        <Button icon={LuArrowRight} onClick={handleContinue}>
          Ver mi resultado
        </Button>
      </div>
    </StepLayout>
  );
};

const AdjustmentsEstimate = () => {
  const { estimate } = useDeclaration();
  const toPay = estimate.balance > 0;
  return (
    <EstimatePanel note='Los ajustes que actives cambian este valor al instante.'>
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
