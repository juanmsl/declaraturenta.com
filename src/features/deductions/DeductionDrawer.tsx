import { useState } from 'react';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import type { GeneralColumn } from '@/domain/general-benefits';
import { severanceExemptShare } from '@/domain/general-benefits';
import { uvtToPesos } from '@/domain/uvt';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Button, CalcRow, Drawer, MoneyField, SelectField, Text } from '@/shared/ui';

export type DeductionId =
  | 'housing'
  | 'dependent'
  | 'prepaid-health'
  | 'severance'
  | 'voluntary'
  | 'gmf'
  | 'icetex'
  | 'independent-severance'
  | 'other-exempt'
  | 'unlimited-exempt'
  | 'exempt-25'
  | 'donations';

const DEDUCTION_TITLES: Record<DeductionId, string> = {
  housing: 'Intereses del crédito de vivienda',
  dependent: 'Dependiente económico',
  'prepaid-health': 'Medicina prepagada',
  severance: 'Cesantías exentas',
  voluntary: 'Aportes voluntarios a pensión y AFC',
  gmf: 'Gravamen a los movimientos financieros (4 × 1.000)',
  icetex: 'Intereses de crédito ICETEX',
  'independent-severance': 'Aportes a cesantías como independiente',
  'other-exempt': 'Otras rentas exentas de tu trabajo',
  'unlimited-exempt': 'Rentas exentas sin el tope del 40 %',
  'exempt-25': 'Renta exenta del 25 %',
  donations: 'Donaciones',
};

const COLUMN_OPTIONS: readonly { value: GeneralColumn; label: string }[] = [
  { value: 'labor', label: 'Rentas de trabajo' },
  { value: 'fees', label: 'Honorarios con costos' },
  { value: 'capital', label: 'Rentas de capital' },
  { value: 'nonLabor', label: 'Rentas no laborales' },
];

type DeductionDrawerProps = {
  deduction: DeductionId | null;
  onClose: () => void;
};

/** Side panel to correct a deduction or see how a calculated one is obtained (ADR 0018). */
export const DeductionDrawer = ({ deduction, onClose }: DeductionDrawerProps) => {
  const { taxYear } = useTaxYear();
  return (
    <Drawer
      isOpen={deduction !== null}
      onClose={onClose}
      title={deduction ? DEDUCTION_TITLES[deduction] : ''}
      subtitle={`Año gravable ${taxYear.year}`}
    >
      {deduction && <DeductionForm key={deduction} deduction={deduction} onClose={onClose} />}
    </Drawer>
  );
};

const DeductionForm = ({ deduction, onClose }: { deduction: DeductionId; onClose: () => void }) => {
  const { taxYear } = useTaxYear();
  const { state, dispatch, result } = useDeclaration();
  const [values, setValues] = useState(state.data.deductions);
  const [voluntary, setVoluntary] = useState(state.data.labor.voluntaryContributions);
  const { labor, benefits } = result;
  const pesos = (uvt: number) => formatCurrency(uvtToPesos(uvt, taxYear));

  const save = () => {
    dispatch({
      type: 'updateData',
      update: data => ({
        ...data,
        deductions: values,
        labor: { ...data.labor, voluntaryContributions: voluntary },
      }),
    });
    onClose();
  };

  const money = (
    key: 'gmfPaid' | 'icetexInterest' | 'independentSeverance' | 'otherLaborExempt' | 'donations',
    label: string,
    hint: string,
  ) => (
    <MoneyField
      name={key}
      label={label}
      value={values[key]}
      onChange={amount => {
        setValues(current => ({ ...current, [key]: amount }));
      }}
      hint={hint}
    />
  );

  const actions = (
    <div className='mt-auto flex items-center justify-end gap-3 border-t border-line pt-5'>
      <Button type='button' variant='ghost' onClick={onClose}>
        {deduction === 'exempt-25' ? 'Cerrar' : 'Cancelar'}
      </Button>
      {deduction !== 'exempt-25' && (
        <Button type='button' onClick={save}>
          Guardar
        </Button>
      )}
    </div>
  );

  const exempt25Others =
    state.data.deductions.severanceReceived +
    benefits.detail.otherLaborExempt +
    (state.data.deductions.unlimitedExempt.column === 'labor' ? benefits.detail.unlimitedExempt : 0);

  if (deduction === 'housing') {
    return (
      <>
        <MoneyField
          name='housingInterestPaid'
          label={`Intereses que pagaste en ${taxYear.year}`}
          value={values.housingInterestPaid}
          onChange={housingInterestPaid => {
            setValues(current => ({ ...current, housingInterestPaid }));
          }}
          hint={`Según el certificado de tu banco. Puedes restar hasta ${formatNumber(taxYear.labor.housingInterestUvt)} UVT (${formatCurrency(uvtToPesos(taxYear.labor.housingInterestUvt, taxYear))}) al año.`}
        />
        {actions}
      </>
    );
  }

  if (deduction === 'prepaid-health') {
    return (
      <>
        <MoneyField
          name='prepaidHealthPaid'
          label={`Pagos de medicina prepagada en ${taxYear.year}`}
          value={values.prepaidHealthPaid}
          onChange={prepaidHealthPaid => {
            setValues(current => ({ ...current, prepaidHealthPaid }));
          }}
          hint={`Puedes restar hasta 16 UVT al mes, ${formatCurrency(uvtToPesos(taxYear.labor.prepaidHealthUvt, taxYear))} al año.`}
        />
        {actions}
      </>
    );
  }

  if (deduction === 'severance') {
    const suggested = Math.round(state.data.labor.salaries / 12);
    const average = values.severanceAverageSalary ?? suggested;
    const share = severanceExemptShare(average, taxYear);
    const brackets = taxYear.labor.severanceExemptBrackets;
    const lastUvt = brackets.at(-1)?.[0] ?? 0;
    return (
      <>
        <MoneyField
          name='severanceReceived'
          label={`Cesantías e intereses que recibiste o te consignaron en ${String(taxYear.year)}`}
          value={values.severanceReceived}
          onChange={severanceReceived => {
            setValues(current => ({ ...current, severanceReceived }));
          }}
          hint='Están en tu certificado de ingresos y retenciones. Ya cuentan dentro de tus ingresos laborales.'
        />
        <MoneyField
          name='severanceAverageSalary'
          label='Tu salario mensual promedio de los últimos seis meses'
          value={average}
          onChange={severanceAverageSalary => {
            setValues(current => ({ ...current, severanceAverageSalary }));
          }}
          hint={`Te sugerimos tus salarios del año entre 12: ${formatCurrency(suggested)}. Son ${formatNumber(Math.round((average / taxYear.uvt) * 100) / 100)} UVT.`}
        />
        <div className='flex flex-col'>
          {brackets.map(([upTo, rate], index) => {
            const from = index === 0 ? 0 : (brackets[index - 1]?.[0] ?? 0);
            const label = `${from === 0 ? 'Hasta' : `Más de ${formatNumber(from)} y hasta`} ${formatNumber(upTo)} UVT`;
            return <CalcRow key={upTo} label={label} value={`${String(Math.round(rate * 100))} % exento`} />;
          })}
          <CalcRow label={`Más de ${formatNumber(lastUvt)} UVT`} value='0 % exento' />
          <CalcRow
            variant='total'
            label={`Exento (${String(Math.round(share * 100))} %)`}
            value={Math.round(values.severanceReceived * share)}
          />
        </div>
        <Text variant='note' className='text-fg-muted'>
          Artículo 206 numeral 4 del Estatuto Tributario. Las cesantías no reciben además la renta exenta del
          25 %.
        </Text>
        {actions}
      </>
    );
  }

  if (deduction === 'voluntary') {
    return (
      <>
        <MoneyField
          name='voluntaryContributions'
          label={`Aportes voluntarios a pensión, AFC y AVC en ${String(taxYear.year)}`}
          value={voluntary}
          onChange={setVoluntary}
          hint={`Exentos hasta el ${String(Math.round(taxYear.benefits.voluntaryContributionsRate * 100))} % de tus ingresos brutos y ${formatNumber(taxYear.benefits.voluntaryContributionsUvt)} UVT al año. Hoy tu límite es ${formatCurrency(benefits.detail.voluntaryContributionsCap)}.`}
        />
        {actions}
      </>
    );
  }

  if (deduction === 'gmf') {
    return (
      <>
        {money(
          'gmfPaid',
          `4 × 1.000 que te cobraron en ${String(taxYear.year)}`,
          `Según los certificados de tus bancos. Restas el ${String(Math.round(taxYear.benefits.gmfRate * 100))} %.`,
        )}
        {actions}
      </>
    );
  }

  if (deduction === 'icetex') {
    return (
      <>
        {money(
          'icetexInterest',
          `Intereses que pagaste al ICETEX en ${String(taxYear.year)}`,
          `Por créditos para tu educación superior. Hasta ${formatNumber(taxYear.benefits.icetexInterestUvt)} UVT (${pesos(taxYear.benefits.icetexInterestUvt)}) al año.`,
        )}
        {actions}
      </>
    );
  }

  if (deduction === 'independent-severance') {
    return (
      <>
        {money(
          'independentSeverance',
          `Aportes a cesantías que hiciste como independiente en ${String(taxYear.year)}`,
          `Hasta ${formatNumber(taxYear.benefits.independentSeveranceUvt)} UVT (${pesos(taxYear.benefits.independentSeveranceUvt)}), sin pasar de 1/12 de tus ingresos del año (art. 126-1 E.T.).`,
        )}
        {actions}
      </>
    );
  }

  if (deduction === 'other-exempt') {
    return (
      <>
        {money(
          'otherLaborExempt',
          'Otras rentas exentas de tu trabajo',
          'Indemnizaciones por accidente de trabajo o enfermedad, protección a la maternidad o gastos de entierro, en lo que corresponde al mínimo legal (art. 206 num. 1 a 3 E.T.).',
        )}
        {actions}
      </>
    );
  }

  if (deduction === 'unlimited-exempt') {
    return (
      <>
        <Text variant='body-m' className='text-fg-secondary'>
          Estas rentas exentas no cuentan para el tope del 40 %: servicios prestados en Bolivia, Ecuador o
          Perú (Decisión 578 de la Comunidad Andina), rentas exentas por un convenio de doble tributación y
          las de los numerales 5 a 8 del artículo 206 (Fuerza Pública, magistrados y jueces, profesores de
          universidades públicas).
        </Text>
        <MoneyField
          name='unlimitedExempt'
          label='Valor exento'
          value={values.unlimitedExempt.amount}
          onChange={amount => {
            setValues(current => ({ ...current, unlimitedExempt: { ...current.unlimitedExempt, amount } }));
          }}
        />
        <SelectField
          name='unlimitedExemptColumn'
          label='¿De qué ingresos sale?'
          value={values.unlimitedExempt.column}
          options={COLUMN_OPTIONS}
          onChange={column => {
            setValues(current => ({ ...current, unlimitedExempt: { ...current.unlimitedExempt, column } }));
          }}
        />
        {actions}
      </>
    );
  }

  if (deduction === 'donations') {
    return (
      <>
        {money(
          'donations',
          `Donaciones que hiciste en ${String(taxYear.year)}`,
          `A entidades sin ánimo de lucro del régimen especial o no contribuyentes, con certificado. Restas el ${String(Math.round(taxYear.discounts.donationRate * 100))} % de tu impuesto (casilla 123).`,
        )}
        <Text variant='body-m' className='text-fg-secondary'>
          Junto con otros descuentos de los artículos 256 y 257-1, no pueden pasar del{' '}
          {Math.round(taxYear.discounts.capRate * 100)} % de tu impuesto de renta. Lo que sobre lo puedes usar
          el año siguiente (art. 258 E.T.).
        </Text>
        {result.donationsExcess > 0 && (
          <Text variant='note' className='text-fg-warning'>
            Este año quedan {formatCurrency(result.donationsExcess)} por encima del tope.
          </Text>
        )}
        {actions}
      </>
    );
  }

  if (deduction === 'dependent') {
    return (
      <>
        <MoneyField
          name='dependents'
          label='¿Cuántos dependientes económicos tienes?'
          currency={false}
          value={values.dependents}
          onChange={dependents => {
            setValues(current => ({ ...current, dependents: Math.max(0, Math.floor(dependents)) }));
          }}
          hint='Por ejemplo, hijos menores de edad o hijos de 18 a 23 años que estudian y dependen de ti. Revisa las condiciones del artículo 387 del Estatuto Tributario.'
        />
        <Text variant='body-m' className='text-fg-secondary'>
          Con uno o más restas el 10 % de tus ingresos brutos laborales, hasta{' '}
          {formatNumber(taxYear.labor.dependentUvt)} UVT (
          {formatCurrency(uvtToPesos(taxYear.labor.dependentUvt, taxYear))}) al año. Además sumamos{' '}
          {taxYear.general.additionalDependentUvt} UVT (
          {formatCurrency(uvtToPesos(taxYear.general.additionalDependentUvt, taxYear))}) por cada dependiente,
          hasta {taxYear.general.maxAdditionalDependents}, por fuera del tope del 40 %. Lo calculamos por ti.
        </Text>
        {actions}
      </>
    );
  }

  return (
    <>
      <Text variant='body-m' className='text-fg-secondary'>
        La ley deja como exento el 25 % de lo que queda de tus pagos laborales después de restar aportes,
        deducciones y otras rentas exentas, hasta {formatNumber(taxYear.labor.exempt25Uvt)} UVT al año.
      </Text>
      <div className='flex flex-col'>
        <CalcRow label='Renta líquida' value={labor.netIncome} />
        <CalcRow variant='subtract' label='Deducciones' value={labor.totalDeductions} />
        <CalcRow variant='subtract' label='Aportes voluntarios' value={labor.voluntaryContributions} />
        <CalcRow variant='subtract' label='Cesantías y otras rentas exentas' value={exempt25Others} />
        <CalcRow
          variant='subtotal'
          label='Base'
          value={Math.max(
            0,
            labor.netIncome - labor.totalDeductions - labor.voluntaryContributions - exempt25Others,
          )}
        />
        <CalcRow
          label={`25 %, hasta ${formatNumber(taxYear.labor.exempt25Uvt)} UVT (${formatCurrency(uvtToPesos(taxYear.labor.exempt25Uvt, taxYear))})`}
          value={labor.exempt25}
        />
      </div>
      {actions}
    </>
  );
};
