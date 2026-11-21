import type { IconType } from 'react-icons';
import { LuCreditCard, LuLandmark, LuReceipt } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import type { DeclarationData } from '@/domain/declaration';
import { uvtToPesos } from '@/domain/tax-years';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Chip, Icon, InlineMoneyField, Text } from '@/shared/ui';

const EXOGENOUS_LABEL = 'Desde exógena';

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
 * in «Importar exógena», right below «Esto encontramos», once the report is read (ADR 0045), as a
 * list like the report's sections with the amount edited in the row (ADR 0049; Figma 03c and 03d).
 */
export const YearMovementsSection = () => {
  const { taxYear } = useTaxYear();
  const { state, dispatch } = useDeclaration();
  const { obligation } = state.data;
  const limitUvt = taxYear.filingTestsUvt.creditCardPurchases;
  const limit = formatCurrency(uvtToPesos(limitUvt, taxYear));

  const update = (change: Partial<Obligation>) => {
    dispatch({
      type: 'updateData',
      update: data => ({ ...data, obligation: { ...data.obligation, ...change } }),
    });
  };

  const rows: { key: AmountKey; label: string; detail: string; icon: IconType }[] = [
    {
      key: 'creditCardPurchases',
      label: 'Compras con tarjeta de crédito',
      detail: 'La suma de todo el año · Reportado por tus bancos',
      icon: LuCreditCard,
    },
    {
      key: 'totalPurchases',
      label: 'Compras y consumos totales',
      detail: 'Todo lo que gastaste, con o sin tarjeta · Reportado por tus bancos y comercios',
      icon: LuReceipt,
    },
    {
      key: 'deposits',
      label: 'Consignaciones, depósitos e inversiones',
      detail: 'Lo que entró a tus cuentas o invertiste · Reportado por tus bancos',
      icon: LuLandmark,
    },
  ];

  return (
    <section aria-labelledby='movements-title' className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <Text id='movements-title' variant='title-s' as='h2'>
          Tus movimientos en {taxYear.year}
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          La DIAN los usa para saber si debes declarar: si alguno pasa de {limit} ({formatNumber(limitUvt)}{' '}
          UVT), declaras. Los tomamos de tu exógena; si alguno no cuadra, corrige el monto.
        </Text>
      </div>
      <ul className='flex flex-col rounded-lg border border-line bg-surface px-5'>
        {rows.map(row => {
          const value = obligation[row.key];
          const fromReport = value > 0 && value === state.exogenous.report.thresholds[REPORT_KEYS[row.key]];
          return (
            <li
              key={row.key}
              className='flex items-center gap-3.5 border-b border-line py-2.5 last:border-b-0'
            >
              <Icon icon={row.icon} size={20} className='text-fg-secondary' />
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <Text variant='body-m-strong'>{row.label}</Text>
                <Text variant='note' className='text-fg-muted'>
                  {row.detail}
                </Text>
              </div>
              {fromReport && <Chip variant='exogenous'>{EXOGENOUS_LABEL}</Chip>}
              <InlineMoneyField
                name={row.key}
                label={row.label}
                value={value}
                onChange={next => {
                  update({ [row.key]: next });
                }}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};
