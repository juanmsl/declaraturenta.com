import { useNavigate } from 'react-router';
import { LuArrowRight, LuCircleAlert, LuCircleCheck } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { FLOW_STEPS } from '@/app/flow';
import { ART_241_BRACKETS } from '@/domain/income-tax-table';
import { TAX_YEAR } from '@/domain/uvt';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Button, CalcRow, Icon, OptionCard, Text } from '@/shared/ui';

const [firstStep, , , , , , draftStep] = FLOW_STEPS;

/** Screen 07 · Resultado (Figma node 10:1188). */
export const ResultPage = () => {
  const navigate = useNavigate();
  const { state, dispatch, result } = useDeclaration();
  const { labor, tableTax } = result;
  const inFavor = result.amountInFavor > 0;
  const toPay = result.amountToPay > 0;
  const { bracket } = tableTax;

  const handleContinue = () => {
    dispatch({ type: 'completeStep', step: 'result' });
    void navigate(draftStep.path);
  };

  return (
    <div className='flex flex-col gap-8 px-14 py-11'>
      <section
        className={cn(
          'flex items-center gap-10 rounded-lg px-10 py-8',
          toPay ? 'bg-coral-soft' : inFavor ? 'bg-mint-soft' : 'bg-subtle',
        )}
      >
        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          <div className={cn('flex items-center gap-2', toPay ? 'text-fg-error' : 'text-fg-success')}>
            <Icon icon={toPay ? LuCircleAlert : LuCircleCheck} size={20} />
            <Text as='h1' variant='body-m-strong' className='text-current'>
              {toPay ? 'Tienes saldo a pagar' : inFavor ? 'Tienes saldo a favor' : 'No tienes saldo a pagar'}
            </Text>
          </div>
          <Text variant='figure-hero'>
            {formatCurrency(toPay ? result.amountToPay : result.amountInFavor)}
          </Text>
          <Text variant='body-l' className='text-fg-secondary'>
            {toPay
              ? 'Te corresponde pagar más de lo que te retuvieron. Lo pagas al presentar tu declaración, a más tardar en tu fecha límite.'
              : inFavor
                ? 'Te retuvieron más de lo que te corresponde pagar. Puedes pedir que la DIAN te lo devuelva o dejarlo para tu declaración del próximo año.'
                : 'Lo que te retuvieron cubre exactamente tu impuesto.'}
          </Text>
        </div>
        {inFavor && (
          <div
            role='radiogroup'
            aria-label='Qué hacer con tu saldo a favor'
            className='flex w-80 shrink-0 flex-col gap-3'
          >
            <OptionCard
              name='refundPreference'
              value='refund'
              selectedValue={state.data.refundPreference}
              onSelect={() => {
                dispatch({ type: 'updateData', update: data => ({ ...data, refundPreference: 'refund' }) });
              }}
              title='Pedir devolución'
              description='La solicitas después de presentar.'
            />
            <OptionCard
              name='refundPreference'
              value='next-year'
              selectedValue={state.data.refundPreference}
              onSelect={() => {
                dispatch({
                  type: 'updateData',
                  update: data => ({ ...data, refundPreference: 'next-year' }),
                });
              }}
              title='Dejarlo para el próximo año'
              description={`Se descuenta de tu impuesto ${TAX_YEAR + 1}.`}
            />
          </div>
        )}
      </section>

      <div className='flex items-start gap-8'>
        <section className='flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-line bg-surface p-6'>
          <Text variant='title-m' as='h2'>
            Cómo llegamos aquí
          </Text>
          <div className='flex flex-col'>
            <CalcRow label='Ingresos brutos' value={result.grossLaborIncome} />
            <CalcRow variant='subtract' label='No constitutivos de renta' value={labor.nonTaxableIncome} />
            <CalcRow variant='subtotal' label='Renta líquida' value={labor.netIncome} />
            <CalcRow
              variant='subtract'
              label='Deducciones y exentas (tope 40 %)'
              value={result.totalBenefits}
            />
            <CalcRow variant='subtotal' label='Renta líquida gravable' value={result.taxableIncome} />
            <CalcRow label='Impuesto sobre la renta' value={result.netIncomeTax} />
            {result.advance.amount > 0 && (
              <CalcRow label='Anticipo para el año siguiente' value={result.advance.amount} />
            )}
            <CalcRow variant='subtract' label='Retenciones en la fuente' value={result.withholdings} />
            <CalcRow
              variant='total'
              label={toPay ? 'Saldo a pagar' : 'Saldo a favor'}
              value={toPay ? result.amountToPay : result.amountInFavor}
            />
          </div>
        </section>

        <section className='flex w-105 shrink-0 flex-col gap-3 rounded-lg border border-line bg-surface p-6'>
          <Text variant='title-m' as='h2'>
            Tu tarifa
          </Text>
          <Text variant='body-m' className='text-fg-secondary'>
            Tu renta líquida gravable equivale a {formatNumber(tableTax.taxableUvt, 2)} UVT.{' '}
            {bracket.rate === 0
              ? `Hasta ${formatNumber(bracket.toUvt ?? 0)} UVT no pagas impuesto.`
              : `Pagas ${formatNumber(bracket.rate * 100)} % sobre lo que pasa de ${formatNumber(bracket.fromUvt)} UVT${bracket.fixedUvt > 0 ? `, más ${formatNumber(bracket.fixedUvt)} UVT fijos` : ''}.`}
          </Text>
          <table className='w-full border-separate border-spacing-y-0.5'>
            <thead>
              <tr>
                <th className='px-3 pb-1.5 text-left leading-none'>
                  <Text as='span' variant='note' className='text-fg-muted'>
                    Rango en UVT
                  </Text>
                </th>
                <th className='px-3 pb-1.5 text-right leading-none whitespace-nowrap'>
                  <Text as='span' variant='note' className='text-fg-muted'>
                    Tarifa marginal
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {ART_241_BRACKETS.map(row => {
                const isCurrent = row === bracket;
                return (
                  <tr key={row.fromUvt} className={isCurrent ? 'bg-sun-soft' : undefined}>
                    <td className='rounded-l-sm px-3 py-2'>
                      <span className='flex items-center gap-2'>
                        <Text
                          as='span'
                          variant={isCurrent ? 'body-m-strong' : 'body-m'}
                          className={cn('flex-1', isCurrent ? 'text-fg' : 'text-fg-secondary')}
                        >
                          {row.toUvt === null
                            ? `Más de ${formatNumber(row.fromUvt)}`
                            : `${formatNumber(row.fromUvt)} – ${formatNumber(row.toUvt)}`}
                        </Text>
                        {isCurrent && (
                          <Text as='span' variant='caption' className='text-fg-warning'>
                            Tú
                          </Text>
                        )}
                      </span>
                    </td>
                    <td className='w-24 rounded-r-sm px-3 py-2'>
                      <span className='flex justify-end'>
                        <Text
                          as='span'
                          variant={isCurrent ? 'body-m-strong' : 'body-m'}
                          className={isCurrent ? 'text-fg' : 'text-fg-secondary'}
                        >
                          {formatNumber(row.rate * 100)} %
                        </Text>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Text variant='note' className='text-fg-muted'>
            Tabla del artículo 241 del Estatuto Tributario.
          </Text>
        </section>
      </div>

      <div className='flex items-start justify-between'>
        <Button variant='secondary' onClick={() => void navigate(firstStep.path)}>
          Revisar mis respuestas
        </Button>
        <Button icon={LuArrowRight} onClick={handleContinue}>
          Ver borrador del 210
        </Button>
      </div>
    </div>
  );
};
