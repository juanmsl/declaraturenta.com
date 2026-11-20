import { useNavigate } from 'react-router';
import { LuArrowRight, LuCircleHelp } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { FLOW_STEPS } from '@/app/flow';
import type { FilingTestId } from '@/domain/filing-obligation';
import { uvtToPesos } from '@/domain/uvt';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Alert, Button, CalcRow, Chip, Icon, StepHeader, StepLayout, Text } from '@/shared/ui';

const TEST_LABELS: Record<FilingTestId, string> = {
  grossAssets: 'Patrimonio bruto al 31 de diciembre',
  grossIncome: 'Ingresos brutos del año',
  creditCardPurchases: 'Compras con tarjeta de crédito',
  totalPurchases: 'Compras y consumos totales',
  deposits: 'Consignaciones, depósitos e inversiones',
};

const nextStep = FLOW_STEPS[1];

/** Screen 02 · ¿Debo declarar? (Figma node 7:350). */
export const ShouldFilePage = () => {
  const { taxYear } = useTaxYear();
  const navigate = useNavigate();
  const { dispatch, result } = useDeclaration();
  const { tests, exceededCount, mustFile } = result.obligation;

  const handleContinue = () => {
    dispatch({ type: 'completeStep', step: 'should-file' });
    void navigate(nextStep.path);
  };

  return (
    <StepLayout aside={<UvtPanel />}>
      <StepHeader
        title='¿Debes declarar renta?'
        description={`Si en ${taxYear.year} superaste cualquiera de estos cinco topes, debes declarar. Los valores vienen de tu exógena; corrige lo que no cuadre.`}
      />

      <ul className='flex flex-col rounded-lg border border-line bg-surface px-6'>
        {tests.map(test => (
          <li key={test.id} className='flex items-center gap-4 border-b border-line py-4 last:border-b-0'>
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <Text variant='body-m-strong'>{TEST_LABELS[test.id]}</Text>
              <Text variant='note' className='text-fg-muted'>
                Tope: {formatNumber(test.limitUvt)} UVT · {formatCurrency(test.limit)}
              </Text>
            </div>
            {test.exceeds ? <Chip variant='cap'>Supera</Chip> : <Chip variant='exogenous'>No supera</Chip>}
            <Text variant='figure-m' className='w-32.5 shrink-0 text-right'>
              {formatCurrency(test.value)}
            </Text>
          </li>
        ))}
      </ul>

      {mustFile ? (
        <Alert variant='warning' title='Sí debes declarar'>
          {exceededCount === 1
            ? 'Superas 1 de los 5 topes, y con uno solo ya debes declarar.'
            : `Superas ${exceededCount} de los 5 topes; con uno solo ya tendrías que declarar.`}{' '}
          Sigamos con tu información exógena.
        </Alert>
      ) : (
        <Alert variant='success' title='No tienes que declarar'>
          No superas ninguno de los cinco topes. Aun así puedes declarar si te conviene, por ejemplo para
          pedir la devolución de tus retenciones.
        </Alert>
      )}

      <div className='flex items-start justify-between'>
        <Button variant='ghost' onClick={() => void navigate('/')}>
          Volver al inicio
        </Button>
        <Button icon={LuArrowRight} onClick={handleContinue}>
          Continuar con la exógena
        </Button>
      </div>
    </StepLayout>
  );
};

const UvtPanel = () => {
  const { taxYear } = useTaxYear();
  return (
    <>
      <div className='flex items-center gap-2'>
        <Icon icon={LuCircleHelp} size={18} className='text-fg-action' />
        <Text variant='title-s' as='h2'>
          ¿Qué es la UVT?
        </Text>
      </div>
      <Text variant='body-m' className='text-fg-secondary'>
        La Unidad de Valor Tributario convierte los topes de la ley en pesos y se actualiza cada año.
      </Text>
      <div className='flex flex-col gap-1 rounded-md bg-rail p-5'>
        <Text variant='caption' className='text-fg-action'>
          1 UVT en {taxYear.year}
        </Text>
        <Text variant='figure-l'>{formatCurrency(taxYear.uvt)}</Text>
      </div>
      <div className='flex flex-col'>
        {[1400, 4500].map(uvt => (
          <CalcRow key={uvt} label={`${formatNumber(uvt)} UVT`} value={uvtToPesos(uvt, taxYear)} />
        ))}
      </div>
      <Text variant='note' className='text-fg-muted'>
        Valor fijado por la DIAN para el año gravable {taxYear.year}.
      </Text>
    </>
  );
};
