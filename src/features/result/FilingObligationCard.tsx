import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import type { FilingTestId } from '@/domain/filing-obligation';
import { formatCurrency, formatLongDate, formatNumber } from '@/shared/lib/format';
import { Alert, Chip, RowContent, Text } from '@/shared/ui';

const TEST_LABELS: Record<FilingTestId, string> = {
  grossAssets: 'Patrimonio bruto al 31 de diciembre',
  grossIncome: 'Ingresos brutos del año',
  creditCardPurchases: 'Compras con tarjeta de crédito',
  totalPurchases: 'Compras y consumos totales',
  deposits: 'Consignaciones, depósitos e inversiones',
};

/**
 * "¿Tenías que declarar?" (Figma 07c): the five filing tests and the VAT answer, checked with all
 * of the person's data. It replaces the old first step «¿Debo declarar?» (ADR 0035).
 */
export const FilingObligationCard = () => {
  const { taxYear } = useTaxYear();
  const { state, result } = useDeclaration();
  const { tests, exceededCount, vatResponsible, mustFile } = result.obligation;
  const deadline = state.taxpayer.filingDeadline;
  const imported = state.exogenous.fileName !== null;

  const reason =
    exceededCount > 0
      ? `Superas ${String(exceededCount)} de los 5 topes${vatResponsible ? ' y eras responsable de IVA' : ''}.`
      : 'Eras responsable de IVA, y eso basta aunque no superes ningún tope.';

  return (
    <section
      aria-labelledby='obligation-title'
      className='flex items-start gap-6 max-xl:flex-col max-xl:items-stretch'
    >
      <div className='flex w-90 shrink-0 flex-col gap-3 max-xl:w-full'>
        <Text id='obligation-title' variant='title-m' as='h2'>
          ¿Tenías que declarar?
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          Lo revisamos con todos tus datos y los topes del año gravable {taxYear.year}. Con superar uno, o si
          eras responsable de IVA, debes declarar.
        </Text>
        {!imported && (
          <Text variant='note' className='text-fg-muted'>
            Sin tu exógena no tenemos tus compras, consumos ni consignaciones del año. Si alguno pasó su tope,
            o eras responsable de IVA, también debes declarar.
          </Text>
        )}
        {mustFile ? (
          <Alert variant='warning' title='Sí tienes que declarar'>
            {reason}{' '}
            {deadline
              ? `Presenta tu declaración antes del ${formatLongDate(deadline)}.`
              : 'Presenta tu declaración antes de tu fecha límite.'}
          </Alert>
        ) : (
          <Alert variant='success' title='No tienes que declarar'>
            No superas ningún tope. Aun así puedes declarar si te conviene, por ejemplo para pedir la
            devolución de tus retenciones.
          </Alert>
        )}
      </div>

      <ul className='flex min-w-0 flex-1 flex-col rounded-lg border border-line bg-surface px-6 max-xl:px-5'>
        {tests.map(test => (
          <li key={test.id} className='flex border-b border-line py-4 max-xl:py-3.5'>
            <RowContent
              title={TEST_LABELS[test.id]}
              detail={`Tope: ${formatNumber(test.limitUvt)} UVT · ${formatCurrency(test.limit)}`}
              badge={
                test.exceeds ? <Chip variant='cap'>Supera</Chip> : <Chip variant='exogenous'>No supera</Chip>
              }
              value={
                <Text variant='figure-m' className='w-32.5 shrink-0 text-right max-xl:w-auto'>
                  {formatCurrency(test.value)}
                </Text>
              }
            />
          </li>
        ))}
        <li className='flex py-4 max-xl:py-3.5'>
          <RowContent
            title='Responsable de IVA'
            detail='Lo respondiste en Importar exógena'
            badge={
              vatResponsible ? <Chip variant='cap'>Sí eras</Chip> : <Chip variant='exogenous'>No eras</Chip>
            }
          />
        </li>
      </ul>
    </section>
  );
};
