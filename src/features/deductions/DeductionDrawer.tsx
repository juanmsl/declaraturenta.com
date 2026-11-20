import { useState } from 'react';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { uvtToPesos } from '@/domain/uvt';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Button, CalcRow, Drawer, MoneyField, Text } from '@/shared/ui';

export type DeductionId = 'housing' | 'dependent' | 'prepaid-health' | 'exempt-25';

const TITLES: Record<DeductionId, string> = {
  housing: 'Intereses del crédito de vivienda',
  dependent: 'Dependiente económico',
  'prepaid-health': 'Medicina prepagada',
  'exempt-25': 'Renta exenta del 25 %',
};

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
      title={deduction ? TITLES[deduction] : ''}
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
  const { labor } = result;

  const save = () => {
    dispatch({ type: 'updateData', update: data => ({ ...data, deductions: values }) });
    onClose();
  };

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
        <CalcRow variant='subtract' label='Otras rentas exentas' value={labor.voluntaryContributions} />
        <CalcRow
          variant='subtotal'
          label='Base'
          value={Math.max(0, labor.netIncome - labor.totalDeductions - labor.voluntaryContributions)}
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
