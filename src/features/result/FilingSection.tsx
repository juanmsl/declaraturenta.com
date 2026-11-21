import { DatePicker } from 'polpo/components';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import type { FilingData } from '@/domain/declaration';
import { formatCurrency, formatLongDate, formatNumber } from '@/shared/lib/format';
import { Alert, MoneyField, OptionCard, Text } from '@/shared/ui';

/** Box 141 (art. 244-1 E.T.); also used in the box panel of the 210 (ADR 0047). */
export const VoluntaryContributionField = () => {
  const { state, dispatch } = useDeclaration();
  return (
    <MoneyField
      name='voluntaryContribution'
      label='Aporte voluntario (opcional)'
      value={state.data.filing.voluntaryContribution.value}
      onChange={value => {
        dispatch({
          type: 'updateData',
          update: data => ({
            ...data,
            filing: { ...data.filing, voluntaryContribution: { mode: 'amount', value } },
          }),
        });
      }}
      hint='Va a programas sociales (art. 244-1 E.T., casilla 141). No es deducible y se paga aparte, con el formulario 490.'
    />
  );
};

const plural = (count: number, word: string) => `${String(count)} ${word}${count === 1 ? '' : 'es'}`;

/**
 * «¿Cuándo vas a presentar?» (Figma 07b): filing date, late filing penalty (box 135, arts. 639 to
 * 642 E.T.) and the voluntary contribution (box 141, art. 244-1).
 */
export const FilingSection = () => {
  const { taxYear } = useTaxYear();
  const { state, dispatch, result } = useDeclaration();
  const { filing } = state.data;
  const deadline = state.taxpayer.filingDeadline;
  const late = result.lateFiling;

  const update = (patch: Partial<FilingData>) => {
    dispatch({ type: 'updateData', update: data => ({ ...data, filing: { ...data.filing, ...patch } }) });
  };

  const baseText =
    late.base === 'tax'
      ? `${formatNumber(taxYear.penalties[filing.summoned ? 'summoned' : 'voluntary'].taxRate * 100)} % de tu impuesto (${formatCurrency(result.taxDue)}) por cada mes o fracción de retraso`
      : late.base === 'income'
        ? `Como no tienes impuesto a cargo, es el ${formatNumber(taxYear.penalties[filing.summoned ? 'summoned' : 'voluntary'].incomeRate * 100)} % de tus ingresos brutos por cada mes o fracción`
        : 'Como no tienes impuesto ni ingresos, se calcula sobre tu patrimonio líquido del año anterior';
  const reductionText =
    late.reduction < 1
      ? ` Como no declaraste tarde ${filing.priorLateFiling === 'none' ? 'en los últimos dos años' : 'en el último año'}, la reducimos al ${formatNumber(late.reduction * 100)} % (art. 640 E.T.).`
      : '';

  return (
    <section
      aria-labelledby='filing-title'
      className='flex flex-col gap-5 rounded-lg border border-line bg-surface p-6'
    >
      <Text id='filing-title' variant='title-m' as='h2'>
        ¿Cuándo vas a presentar?
      </Text>
      <div className='flex items-start gap-6'>
        <div className='text-field flex min-w-0 flex-1 flex-col gap-2'>
          <DatePicker
            name='filingDate'
            label='Fecha de presentación'
            type='date'
            value={filing.date ?? ''}
            setValue={date => {
              update({ date: date || null });
            }}
          />
          <Text variant='note' className='text-fg-muted'>
            {deadline
              ? `Tu fecha límite ${deadline < (filing.date ?? '') ? 'era' : 'es'} el ${formatLongDate(deadline)}.`
              : 'Escribe los dos últimos dígitos de tu NIT en Inicio para conocer tu fecha límite.'}
          </Text>
        </div>
        <div className='min-w-0 flex-1'>
          <VoluntaryContributionField />
        </div>
      </div>

      {late.months > 0 && (
        <>
          <div className='flex flex-col gap-3'>
            <Text id='prior-late-question' variant='title-s' as='h3'>
              ¿Declaraste tarde alguna vez en los últimos dos años?
            </Text>
            <div role='radiogroup' aria-labelledby='prior-late-question' className='flex items-start gap-3'>
              <OptionCard
                name='priorLateFiling'
                value='none'
                selectedValue={filing.priorLateFiling}
                onSelect={() => {
                  update({ priorLateFiling: 'none' });
                }}
                title='No'
                description='La sanción baja al 50 %.'
              />
              <OptionCard
                name='priorLateFiling'
                value='more-than-a-year'
                selectedValue={filing.priorLateFiling}
                onSelect={() => {
                  update({ priorLateFiling: 'more-than-a-year' });
                }}
                title='Sí, hace más de un año'
                description='La sanción baja al 75 %.'
              />
              <OptionCard
                name='priorLateFiling'
                value='within-a-year'
                selectedValue={filing.priorLateFiling}
                onSelect={() => {
                  update({ priorLateFiling: 'within-a-year' });
                }}
                title='Sí, en el último año'
                description='Pagas la sanción completa.'
              />
            </div>
          </div>
          <div className='flex flex-col gap-3'>
            <Text id='summoned-question' variant='title-s' as='h3'>
              ¿La DIAN te envió un emplazamiento para declarar?
            </Text>
            <div role='radiogroup' aria-labelledby='summoned-question' className='flex items-start gap-3'>
              <OptionCard
                name='summoned'
                value='no'
                selectedValue={filing.summoned ? 'yes' : 'no'}
                onSelect={() => {
                  update({ summoned: false });
                }}
                title='No'
                description='Declaras por tu cuenta (art. 641).'
              />
              <OptionCard
                name='summoned'
                value='yes'
                selectedValue={filing.summoned ? 'yes' : 'no'}
                onSelect={() => {
                  update({ summoned: true });
                }}
                title='Sí'
                description='La sanción se duplica y no tiene reducción (art. 642).'
              />
            </div>
          </div>
          {late.base === 'assets' && (
            <MoneyField
              name='previousNetAssets'
              label={`Patrimonio líquido de tu declaración ${String(taxYear.year - 1)}`}
              value={filing.previousNetAssets}
              onChange={previousNetAssets => {
                update({ previousNetAssets });
              }}
            />
          )}
          <Alert
            variant='warning'
            title={`Presentas ${plural(late.months, 'mes')} tarde: sanción de ${formatCurrency(late.penalty)}`}
          >
            {baseText} (art. {filing.summoned ? '642' : '641'} E.T.).{reductionText}{' '}
            {late.minimumApplied
              ? `No puede ser menor a ${formatNumber(taxYear.penalties.minimumUvt)} UVT de ${String(taxYear.filingYear)} (${formatCurrency(late.penalty)}).`
              : `Nunca es menor a ${formatNumber(taxYear.penalties.minimumUvt)} UVT.`}{' '}
            Va en la casilla 135 y{' '}
            {result.amountToPay > 0 ? 'se suma a tu saldo a pagar' : 'se resta de tu saldo a favor'}. Si
            tienes saldo a pagar, al pagarlo también se cobran intereses de mora.
          </Alert>
        </>
      )}
    </section>
  );
};
