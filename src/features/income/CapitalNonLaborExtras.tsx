import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import type { DeclarationData } from '@/domain/declaration';
import { Button, MoneyField } from '@/shared/ui';

/**
 * Less common amounts of rentas de capital and no laborales (boxes 60, 75, 76 and 77), behind a
 * link in Ingresos and open in the box panel of the 210 (ADR 0047).
 */
export const CapitalNonLaborExtras = ({ alwaysOpen = false }: { alwaysOpen?: boolean }) => {
  const { state, dispatch } = useDeclaration();
  const { capital, nonLabor } = state.data;
  const hasValues =
    capital.costs > 0 || nonLabor.returns > 0 || nonLabor.independentContributions > 0 || nonLabor.costs > 0;
  const [isOpen, setIsOpen] = useState(alwaysOpen || hasValues);

  const updateCapital = (patch: Partial<DeclarationData['capital']>) => {
    dispatch({ type: 'updateData', update: data => ({ ...data, capital: { ...data.capital, ...patch } }) });
  };
  const updateNonLabor = (patch: Partial<DeclarationData['nonLabor']>) => {
    dispatch({ type: 'updateData', update: data => ({ ...data, nonLabor: { ...data.nonLabor, ...patch } }) });
  };

  if (!isOpen) {
    return (
      <div>
        <Button
          variant='ghost'
          icon={LuChevronDown}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Tengo costos, devoluciones o aportes en estas rentas
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5 border-l-2 border-line pl-5'>
      <MoneyField
        name='capitalCosts'
        label='Costos y gastos de tus rentas de capital (casilla 60)'
        value={capital.costs}
        onChange={costs => {
          updateCapital({ costs });
        }}
        hint='Solo los que tengan relación con esos ingresos y estén soportados.'
      />
      <MoneyField
        name='nonLaborReturns'
        label='Devoluciones, rebajas y descuentos de tus otros ingresos (casilla 75)'
        value={nonLabor.returns}
        onChange={returns => {
          updateNonLabor({ returns });
        }}
      />
      <MoneyField
        name='nonLaborContributions'
        label='Aportes obligatorios a pensión como independiente sobre estos ingresos (casilla 76)'
        value={nonLabor.independentContributions}
        onChange={independentContributions => {
          updateNonLabor({ independentContributions });
        }}
        hint='No pagan impuesto. Los restamos antes de calcular.'
      />
      <MoneyField
        name='nonLaborCosts'
        label='Costos y gastos de tus otros ingresos (casilla 77)'
        value={nonLabor.costs}
        onChange={costs => {
          updateNonLabor({ costs });
        }}
        hint='Solo los que tengan relación con esos ingresos y estén soportados.'
      />
    </div>
  );
};
