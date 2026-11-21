import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { OptionCard, Text } from '@/shared/ui';

/**
 * «¿Eras responsable de IVA?»: with it alone the person must file. Asked in «Importar exógena»
 * always, with or without the report, at the end of the step (ADR 0045).
 */
export const VatQuestion = () => {
  const { taxYear } = useTaxYear();
  const { state, dispatch } = useDeclaration();
  const { vatResponsible } = state.data.obligation;

  const update = (value: boolean) => {
    dispatch({
      type: 'updateData',
      update: data => ({ ...data, obligation: { ...data.obligation, vatResponsible: value } }),
    });
  };

  return (
    <section aria-labelledby='vat-question' className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <Text id='vat-question' variant='title-s' as='h2'>
          ¿Eras responsable de IVA en {taxYear.year}?
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          Es decir, si debías cobrar IVA en lo que vendías o en tus servicios. En ese caso declaras renta
          aunque no superes ningún tope.
        </Text>
      </div>
      <div role='radiogroup' aria-labelledby='vat-question' className='flex items-start gap-3'>
        <OptionCard
          name='vatResponsible'
          value='no'
          selectedValue={vatResponsible ? 'yes' : 'no'}
          onSelect={() => {
            update(false);
          }}
          title='No'
          description='No cobraba IVA.'
        />
        <OptionCard
          name='vatResponsible'
          value='yes'
          selectedValue={vatResponsible ? 'yes' : 'no'}
          onSelect={() => {
            update(true);
          }}
          title='Sí'
          description='Estaba inscrito en el RUT como responsable de IVA.'
        />
      </div>
    </section>
  );
};
