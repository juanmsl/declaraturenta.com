import { useDeclaration } from '@/app/declaration/declaration-context';
import { OptionCard, Text } from '@/shared/ui';

/** «¿Tuviste también ingresos como independiente?»: turns the fees section on (ADR 0032). */
export const IndependentIncomeQuestion = () => {
  const { state, dispatch } = useDeclaration();
  const { hasIndependentIncome } = state.data.labor;
  const selected = hasIndependentIncome === null ? '' : hasIndependentIncome ? 'yes' : 'no';

  const set = (value: boolean) => {
    dispatch({
      type: 'updateData',
      update: data => ({ ...data, labor: { ...data.labor, hasIndependentIncome: value } }),
    });
  };

  return (
    <>
      <Text id='independent-question' variant='title-s' as='h2'>
        ¿Tuviste también ingresos como independiente?
      </Text>
      <div
        role='radiogroup'
        aria-labelledby='independent-question'
        className='flex items-start gap-3 max-md:flex-col max-md:items-stretch'
      >
        <OptionCard
          name='hasIndependentIncome'
          value='no'
          selectedValue={selected}
          onSelect={() => {
            set(false);
          }}
          title='No, solo tuve empleo'
          description='No te preguntamos por honorarios.'
        />
        <OptionCard
          name='hasIndependentIncome'
          value='yes'
          selectedValue={selected}
          onSelect={() => {
            set(true);
          }}
          title='Sí, honorarios o servicios'
          description='Te preguntaremos por ellos ahora.'
        />
      </div>
    </>
  );
};
