import { useDeclaration } from '@/app/declaration/declaration-context';
import type { DeclarationData, FeesOption } from '@/domain/declaration';
import { formatCurrency } from '@/shared/lib/format';
import { Alert, MoneyField, OptionCard, Text } from '@/shared/ui';

import { ADJUSTMENT, EXOGENOUS_ORIGIN, isFromExogenous, totalOf, withTotal } from './income-concepts';

/** Fees and services as an independent (ADR 0032): amounts, and costs vs. 25 % exempt. */
export const FeesSection = () => {
  const { state, dispatch, result } = useDeclaration();
  const { fees } = state.data;
  const comparison = result.feesComparison;
  const applied = result.fees.option;

  const updateFees = (patch: Partial<DeclarationData['fees']>) => {
    dispatch({ type: 'updateData', update: data => ({ ...data, fees: { ...data.fees, ...patch } }) });
  };

  const optionDescription = (option: FeesOption) => {
    if (!comparison) return undefined;
    const tax = formatCurrency(option === 'costs' ? comparison.costs : comparison.exempt);
    return comparison.suggested === option
      ? `Impuesto a cargo: ${tax}. Es la que te deja menos impuesto.`
      : `Impuesto a cargo: ${tax}.`;
  };

  return (
    <section className='flex flex-col gap-5' aria-labelledby='fees-title'>
      <div className='flex flex-col gap-1'>
        <Text id='fees-title' variant='title-s' as='h2'>
          Honorarios y servicios
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          Lo que te pagaron como independiente, según tus facturas o certificados.
        </Text>
      </div>
      <MoneyField
        name='feesIncome'
        label='Honorarios y pagos por servicios'
        value={totalOf(fees.concepts)}
        onChange={total => {
          updateFees({ concepts: withTotal(fees.concepts, total, ADJUSTMENT) });
        }}
        origin={isFromExogenous(fees.concepts) ? EXOGENOUS_ORIGIN : undefined}
      />
      <MoneyField
        name='feesNonTaxableIncome'
        label='Aportes obligatorios a pensión y solidaridad como independiente'
        value={fees.nonTaxableIncome}
        onChange={nonTaxableIncome => {
          updateFees({ nonTaxableIncome });
        }}
        hint='No pagan impuesto. Los restamos antes de calcular.'
      />
      <MoneyField
        name='feesCosts'
        label='Costos y gastos de tu actividad'
        value={fees.costs}
        onChange={costs => {
          updateFees({ costs });
        }}
        hint='Solo los que tengan factura electrónica, nómina electrónica o documento soporte.'
      />

      {comparison && (
        <>
          <Text id='fees-option' variant='body-m-strong' as='h3'>
            ¿Cómo quieres declarar tus honorarios?
          </Text>
          <Text variant='body-m' className='-mt-3 text-fg-secondary'>
            La ley te deja elegir una de las dos, no ambas. Calculamos las dos por ti
            {fees.option ? '.' : ' y, mientras eliges, usamos la que te deja menos impuesto.'}
          </Text>
          <div role='radiogroup' aria-labelledby='fees-option' className='flex items-start gap-3'>
            <OptionCard
              name='feesOption'
              value='exempt'
              selectedValue={applied}
              onSelect={() => {
                updateFees({ option: 'exempt' });
              }}
              title='Renta exenta del 25 %'
              description={optionDescription('exempt')}
            />
            <OptionCard
              name='feesOption'
              value='costs'
              selectedValue={applied}
              onSelect={() => {
                updateFees({ option: 'costs' });
              }}
              title='Restar costos y gastos'
              description={optionDescription('costs')}
            />
          </div>
        </>
      )}

      {result.fees.exceedsIndicativeCap && (
        <Alert variant='warning' title='Tus costos superan el 60 % de tus honorarios'>
          Es el tope indicativo del artículo 336-1. Puedes restarlos si tienen soporte, pero debes marcar con
          una X la casilla 140 al presentar.
        </Alert>
      )}
    </section>
  );
};
