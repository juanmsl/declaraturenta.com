import type { ReactNode } from 'react';

import { useDeclaration } from '@/app/declaration/declaration-context';
import type { AdjustmentId, Adjustments } from '@/domain/declaration';
import { formatCurrency } from '@/shared/lib/format';
import { MoneyField, ToggleField } from '@/shared/ui';

const Indented = ({ children }: { children: ReactNode }) => (
  <div className='-mt-2 flex flex-col gap-5 border-l-2 border-line pl-5'>{children}</div>
);

/**
 * The uncommon adjustments of «Otros ajustes», each behind its switch (ADR 0038). `only` shows a
 * subset, as in the box panel of the 210 (ADR 0047).
 */
export const AdjustmentsSections = ({ only }: { only?: readonly AdjustmentId[] }) => {
  const { state, dispatch, result } = useDeclaration();
  const { adjustments } = state.data;
  const isOn = (id: AdjustmentId) => adjustments.enabled.includes(id);

  const update = (patch: Partial<Adjustments>) => {
    dispatch({
      type: 'updateData',
      update: data => ({ ...data, adjustments: { ...data.adjustments, ...patch } }),
    });
  };
  const toggle = (id: AdjustmentId) => {
    update({
      enabled: isOn(id) ? adjustments.enabled.filter(item => item !== id) : [...adjustments.enabled, id],
    });
  };

  const money = (
    name: string,
    label: string,
    value: number,
    onChange: (value: number) => void,
    hint?: string,
  ) => <MoneyField name={name} label={label} value={value} onChange={onChange} hint={hint} />;
  const show = (id: AdjustmentId) => only === undefined || only.includes(id);

  return (
    <section className='flex flex-col gap-5'>
      {show('losses') && (
        <>
          <ToggleField
            name='losses'
            label='Tengo pérdidas fiscales de años anteriores'
            description='Pérdidas que no alcanzaste a compensar en declaraciones pasadas (casillas 56, 72, 89 y 94).'
            checked={isOn('losses')}
            onChange={() => {
              toggle('losses');
            }}
          />
          {isOn('losses') && (
            <Indented>
              {money(
                'lossesFees',
                'Contra honorarios con costos (casilla 56)',
                adjustments.losses.fees,
                fees => {
                  update({ losses: { ...adjustments.losses, fees } });
                },
                `Hasta tu renta líquida ordinaria de honorarios. Se compensan ${formatCurrency(result.compensations.fees)}.`,
              )}
              {money(
                'lossesCapital',
                'Contra rentas de capital (casilla 72)',
                adjustments.losses.capital,
                capital => {
                  update({ losses: { ...adjustments.losses, capital } });
                },
                `Se compensan ${formatCurrency(result.compensations.capital)}.`,
              )}
              {money(
                'lossesNonLabor',
                'Contra rentas no laborales (casilla 89)',
                adjustments.losses.nonLabor,
                nonLabor => {
                  update({ losses: { ...adjustments.losses, nonLabor } });
                },
                `Se compensan ${formatCurrency(result.compensations.nonLabor)}.`,
              )}
              {money(
                'lossesUntil2018',
                'Pérdidas de 2018 y antes (casilla 94)',
                adjustments.losses.until2018,
                until2018 => {
                  update({ losses: { ...adjustments.losses, until2018 } });
                },
                `Se restan de la cédula general sin tocar tus rentas de trabajo. Se compensan ${formatCurrency(result.compensations.until2018)}.`,
              )}
            </Indented>
          )}
        </>
      )}
      {show('presumptive-excess') && (
        <>
          <ToggleField
            name='presumptive-excess'
            label='Tuve excesos de renta presuntiva'
            description='Excesos de renta presuntiva de años anteriores que aún puedes compensar (casilla 95).'
            checked={isOn('presumptive-excess')}
            onChange={() => {
              toggle('presumptive-excess');
            }}
          />
          {isOn('presumptive-excess') && (
            <Indented>
              {money(
                'presumptiveExcess',
                'Exceso de renta presuntiva por compensar (casilla 95)',
                adjustments.presumptiveExcess,
                presumptiveExcess => {
                  update({ presumptiveExcess });
                },
                `Hasta tu renta líquida ordinaria (art. 189 E.T.). Se compensan ${formatCurrency(result.compensations.presumptiveExcess)}.`,
              )}
            </Indented>
          )}
        </>
      )}
      {show('taxable-additions') && (
        <>
          <ToggleField
            name='taxable-additions'
            label='Debo sumar rentas gravables'
            description='Activos omitidos, pasivos inexistentes o deducciones que recuperaste (casilla 96).'
            checked={isOn('taxable-additions')}
            onChange={() => {
              toggle('taxable-additions');
            }}
          />
          {isOn('taxable-additions') && (
            <Indented>
              {money(
                'taxableAdditions',
                'Rentas gravables (casilla 96)',
                adjustments.taxableAdditions,
                taxableAdditions => {
                  update({ taxableAdditions });
                },
                'Incluye también la renta por comparación patrimonial. No admite rentas exentas ni deducciones.',
              )}
            </Indented>
          )}
        </>
      )}
      {show('ece') && (
        <>
          <ToggleField
            name='ece'
            label='Tengo rentas pasivas de una sociedad del exterior (ECE)'
            description='Si controlas una entidad en el exterior que recibe rentas pasivas (casillas 62 y 79).'
            checked={isOn('ece')}
            onChange={() => {
              toggle('ece');
            }}
          />
          {isOn('ece') && (
            <Indented>
              {money(
                'eceCapitalIncome',
                'Ingresos pasivos de capital',
                adjustments.ece.capitalIncome,
                capitalIncome => {
                  update({ ece: { ...adjustments.ece, capitalIncome } });
                },
              )}
              {money(
                'eceCapitalCosts',
                'Costos y deducciones de esos ingresos',
                adjustments.ece.capitalCosts,
                capitalCosts => {
                  update({ ece: { ...adjustments.ece, capitalCosts } });
                },
                `Renta líquida pasiva de capital (casilla 62): ${formatCurrency(result.ece.capital)}.`,
              )}
              {money(
                'eceNonLaborIncome',
                'Ingresos pasivos no laborales',
                adjustments.ece.nonLaborIncome,
                nonLaborIncome => {
                  update({ ece: { ...adjustments.ece, nonLaborIncome } });
                },
              )}
              {money(
                'eceNonLaborCosts',
                'Costos y deducciones de esos ingresos',
                adjustments.ece.nonLaborCosts,
                nonLaborCosts => {
                  update({ ece: { ...adjustments.ece, nonLaborCosts } });
                },
                `Renta líquida pasiva no laboral (casilla 79): ${formatCurrency(result.ece.nonLabor)}. Usa tu participación en la ECE (arts. 882 a 893 E.T.).`,
              )}
            </Indented>
          )}
        </>
      )}
      {show('foreign-taxes') && (
        <>
          <ToggleField
            name='foreign-taxes'
            label='Pagué impuestos en el exterior'
            description='Impuesto de renta pagado en otro país por ingresos que también declaras aquí (casillas 122 y 128).'
            checked={isOn('foreign-taxes')}
            onChange={() => {
              toggle('foreign-taxes');
            }}
          />
          {isOn('foreign-taxes') && (
            <Indented>
              {money(
                'foreignTaxPaid',
                'Impuesto pagado en el exterior por tus rentas (casilla 122)',
                adjustments.foreignTax.paid,
                paid => {
                  update({ foreignTax: { ...adjustments.foreignTax, paid } });
                },
              )}
              {money(
                'foreignIncome',
                'Renta líquida de fuente extranjera sobre la que lo pagaste',
                adjustments.foreignTax.foreignIncome,
                foreignIncome => {
                  update({ foreignTax: { ...adjustments.foreignTax, foreignIncome } });
                },
                `Descontamos hasta el impuesto que pagarías en Colombia por esas mismas rentas (art. 254 E.T.): ${formatCurrency(result.foreignTaxDiscount)}.`,
              )}
              {money(
                'occasionalForeignTax',
                'Impuesto pagado en el exterior por ganancias ocasionales (casilla 128)',
                adjustments.occasionalForeignTax,
                occasionalForeignTax => {
                  update({ occasionalForeignTax });
                },
                'Solo si un convenio de doble imposición lo permite. Hasta tu impuesto de ganancias ocasionales.',
              )}
            </Indented>
          )}
        </>
      )}
      {show('can-dividends') && (
        <>
          <ToggleField
            name='can-dividends'
            label='Recibí dividendos de un país de la Comunidad Andina'
            description='Bolivia, Ecuador o Perú. Pueden estar exentos (casilla 110).'
            checked={isOn('can-dividends')}
            onChange={() => {
              toggle('can-dividends');
            }}
          />
          {isOn('can-dividends') && (
            <Indented>
              {money(
                'canDividends',
                'Dividendos de la Comunidad Andina incluidos en los del exterior (casilla 110)',
                adjustments.canDividends,
                canDividends => {
                  update({ canDividends });
                },
                `Decisión 578. Hasta tus dividendos del exterior (casilla 109): ${formatCurrency(result.dividends.foreign)}.`,
              )}
            </Indented>
          )}
        </>
      )}
      {show('other-discounts') && (
        <>
          <ToggleField
            name='other-discounts'
            label='Tengo otros descuentos tributarios'
            description='Inversión en ciencia, tecnología e innovación (art. 256) o becas por impuestos (art. 257-1), en la casilla 123.'
            checked={isOn('other-discounts')}
            onChange={() => {
              toggle('other-discounts');
            }}
          />
          {isOn('other-discounts') && (
            <Indented>
              {money(
                'otherDiscounts',
                'Valor del descuento',
                adjustments.otherDiscounts,
                otherDiscounts => {
                  update({ otherDiscounts });
                },
                'El descuento ya calculado, no la inversión. Junto con tus donaciones no puede pasar del 30 % de tu impuesto (art. 258 E.T.).',
              )}
            </Indented>
          )}
        </>
      )}
    </section>
  );
};
