import { useState } from 'react';
import { LuCalendar } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { formatLongDate } from '@/shared/lib/format';
import { Button, Icon, Text, TextField } from '@/shared/ui';

/**
 * "Tu fecha límite": deadline from the last two digits of the NIT. They come from the exogenous
 * report or, without it, the person types them here (ADR 0035).
 */
export const DeadlineCard = () => {
  const { state, dispatch } = useDeclaration();
  const { taxpayer } = state;
  const fromReport = state.exogenous.fileName !== null;
  const [digits, setDigits] = useState(taxpayer.nitLastDigits ?? '');

  const handleDigits = (value: string) => {
    const clean = value.replace(/\D/gu, '').slice(0, 2);
    setDigits(clean);
    if (clean.length === 2 || taxpayer.nitLastDigits) dispatch({ type: 'setNitDigits', digits: clean });
  };

  return (
    <section className='flex flex-col gap-1.5 rounded-lg bg-sun-soft p-6'>
      <div className='flex items-center gap-2'>
        <Icon icon={LuCalendar} size={18} className='text-fg-warning' />
        <Text variant='caption' className='text-fg-warning'>
          Tu fecha límite
        </Text>
      </div>
      {taxpayer.filingDeadline ? (
        <>
          <Text variant='title-l' as='p'>
            {formatLongDate(taxpayer.filingDeadline)}
          </Text>
          <Text variant='body-m' className='text-fg-secondary'>
            Según los dos últimos dígitos de tu NIT ({taxpayer.nitLastDigits}). Declarar tarde genera sanción
            e intereses.
          </Text>
          {!fromReport && (
            <Button
              variant='ghost'
              className='self-start'
              onClick={() => {
                handleDigits('');
              }}
            >
              Cambiar los dígitos
            </Button>
          )}
        </>
      ) : (
        <>
          <Text variant='title-l' as='p'>
            Aún sin calcular
          </Text>
          <Text variant='body-m' className='text-fg-secondary'>
            Depende de los dos últimos dígitos de tu NIT. La calculamos cuando leemos tu exógena, o escríbelos
            aquí.
          </Text>
          <TextField
            name='nit-last-digits'
            label='Últimos dos dígitos de tu NIT'
            value={digits}
            onChange={handleDigits}
            placeholder='Ej.: 47'
            hint='Sin el dígito de verificación.'
          />
        </>
      )}
    </section>
  );
};
