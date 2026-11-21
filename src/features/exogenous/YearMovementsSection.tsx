import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import type { DeclarationData } from '@/domain/declaration';
import { uvtToPesos } from '@/domain/tax-years';
import { formatCurrency } from '@/shared/lib/format';
import { MoneyField, Text } from '@/shared/ui';

const EXOGENOUS_ORIGIN = { variant: 'exogenous', label: 'Desde exógena' } as const;

type Obligation = DeclarationData['obligation'];
type AmountKey = Exclude<keyof Obligation, 'vatResponsible'>;

/** Where each amount comes from in the exogenous report. */
const REPORT_KEYS = {
  creditCardPurchases: 'cardSpending',
  totalPurchases: 'purchases',
  deposits: 'deposits',
} as const satisfies Record<AmountKey, string>;

/**
 * "Tus movimientos en el año": the values only used to know whether the person had to file. Shown
 * in «Importar exógena», right below «Esto encontramos», once the report is read (ADR 0045).
 */
export const YearMovementsSection = () => {
  const { taxYear } = useTaxYear();
  const { state, dispatch } = useDeclaration();
  const { obligation } = state.data;
  const limit = formatCurrency(uvtToPesos(taxYear.filingTestsUvt.creditCardPurchases, taxYear));

  const update = (change: Partial<Obligation>) => {
    dispatch({
      type: 'updateData',
      update: data => ({ ...data, obligation: { ...data.obligation, ...change } }),
    });
  };

  const fields: { key: AmountKey; label: string; hint: string }[] = [
    {
      key: 'creditCardPurchases',
      label: 'Compras con tarjeta de crédito',
      hint: `La suma de todo el año. Tope: ${limit}.`,
    },
    {
      key: 'totalPurchases',
      label: 'Compras y consumos totales',
      hint: `Todo lo que gastaste en el año, con o sin tarjeta. Tope: ${limit}.`,
    },
    {
      key: 'deposits',
      label: 'Consignaciones, depósitos e inversiones',
      hint: `Lo que entró a tus cuentas o invertiste. Tope: ${limit}.`,
    },
  ];

  return (
    <section aria-labelledby='movements-title' className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <Text id='movements-title' variant='title-s' as='h2'>
          Tus movimientos en {taxYear.year}
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          La DIAN los usa para saber si debes declarar. Los tomamos de tu exógena; corrige lo que no cuadre.
        </Text>
      </div>
      {fields.map(field => (
        <MoneyField
          key={field.key}
          name={field.key}
          label={field.label}
          value={obligation[field.key]}
          onChange={value => {
            update({ [field.key]: value });
          }}
          origin={
            obligation[field.key] > 0 &&
            obligation[field.key] === state.exogenous.report.thresholds[REPORT_KEYS[field.key]]
              ? EXOGENOUS_ORIGIN
              : undefined
          }
          hint={field.hint}
        />
      ))}
    </section>
  );
};
