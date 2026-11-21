import { useState } from 'react';
import { LuPencil, LuTrash2 } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { isPreviousReturnGiven, PreviousReturnError } from '@/domain/previous-return';
import type { PreviousReturnValues } from '@/domain/previous-return';
import { formatCurrency } from '@/shared/lib/format';
import { Button, FileDropzone, MoneyField, OptionCard, Text } from '@/shared/ui';

import { readPreviousReturn } from './read-previous-return';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FROM_RETURN = { variant: 'exogenous', label: 'Desde tu declaración' } as const;

/**
 * «Tu declaración del año pasado (opcional)» in «Importar exógena» (ADR 0048): reads last year's
 * Formulario 210 PDF, or lets the person type its values, for boxes 130 and 131, the advance and
 * the late filing penalty.
 */
export const PreviousReturnCard = () => {
  const { taxYear } = useTaxYear();
  const { state, dispatch } = useDeclaration();
  const { previousReturn: record } = state;
  const { data } = state;
  const lastYear = taxYear.year - 1;
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setIsReading(true);
    try {
      const read = await readPreviousReturn(file);
      if (read.year !== lastYear) {
        setError(
          `Esta declaración es del año gravable ${String(read.year)}. Sube la del ${String(lastYear)}.`,
        );
        return;
      }
      dispatch({ type: 'importPreviousReturn', fileName: file.name, values: read.values });
    } catch (caught) {
      setError(
        caught instanceof PreviousReturnError
          ? 'No pudimos leer este PDF como un formulario 210 de la DIAN. Descárgalo de nuevo desde el portal o escribe los valores a mano.'
          : 'No pudimos abrir este PDF. Descárgalo de nuevo desde el portal de la DIAN o escribe los valores a mano.',
      );
    } finally {
      setIsReading(false);
    }
  };

  const fromReturn = (key: keyof PreviousReturnValues, value: number) =>
    record.read !== null && record.read[key] === value && value > 0 ? FROM_RETURN : undefined;

  const updateData = (update: (current: typeof data) => typeof data) => {
    dispatch({ type: 'updateData', update });
  };

  return (
    <section aria-labelledby='previous-return-title' className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <Text id='previous-return-title' variant='title-s' as='h2'>
          Tu declaración del año pasado (opcional)
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          Si declaraste renta por el año gravable {lastYear}, súbela. Tomamos de ahí el anticipo, el saldo a
          favor y el impuesto del año pasado.
        </Text>
      </div>

      <FileDropzone
        accept='.pdf'
        maxSize={MAX_FILE_SIZE}
        hint={
          isReading
            ? 'Leyendo tu declaración…'
            : `PDF del formulario 210 del año gravable ${String(lastYear)}, como lo descargas de la DIAN. Se lee en este navegador; no lo enviamos a ningún lado.`
        }
        onFileSelected={file => void handleFile(file)}
        error={error}
        selected={
          record.fileName
            ? { name: record.fileName, description: `Leída · año gravable ${String(lastYear)}` }
            : undefined
        }
      />

      {!isPreviousReturnGiven(record) && (
        <div>
          <Button
            variant='ghost'
            icon={LuPencil}
            onClick={() => {
              dispatch({ type: 'updatePreviousReturn', patch: { manual: true } });
            }}
          >
            No tengo el PDF: escribir los valores
          </Button>
        </div>
      )}

      {isPreviousReturnGiven(record) && (
        <div className='flex flex-col gap-5 border-l-2 border-line pl-5'>
          <MoneyField
            name='previousNetTax'
            label='Impuesto neto de renta (casilla 126)'
            value={data.general.previousYearNetTax}
            onChange={previousYearNetTax => {
              updateData(current => ({ ...current, general: { ...current.general, previousYearNetTax } }));
            }}
            origin={fromReturn('netTax', data.general.previousYearNetTax)}
            hint='Con él calculamos el anticipo de este año, con el promedio de los dos últimos años.'
          />
          <MoneyField
            name='previousAdvance'
            label='Anticipo renta para el año gravable siguiente (casilla 133)'
            value={data.previousYearAdvance}
            onChange={previousYearAdvance => {
              updateData(current => ({ ...current, previousYearAdvance }));
            }}
            origin={fromReturn('advance', data.previousYearAdvance)}
            hint={`Es el anticipo que ya liquidaste para ${String(taxYear.year)}: va en tu casilla 130 y se descuenta.`}
          />
          <MoneyField
            name='previousBalanceInFavor'
            label='Total saldo a favor (casilla 137)'
            value={record.balanceInFavor}
            onChange={balanceInFavor => {
              dispatch({ type: 'updatePreviousReturn', patch: { balanceInFavor } });
            }}
            origin={fromReturn('balanceInFavor', record.balanceInFavor)}
          />
          {record.balanceInFavor > 0 && (
            <div className='flex flex-col gap-3'>
              <Text id='refund-question' variant='body-m-strong'>
                ¿Pediste que la DIAN te devolviera o compensara ese saldo a favor?
              </Text>
              <div role='radiogroup' aria-labelledby='refund-question' className='flex items-start gap-3'>
                <OptionCard
                  name='refundRequested'
                  value='no'
                  selectedValue={record.refundRequested === null ? '' : record.refundRequested ? 'yes' : 'no'}
                  onSelect={() => {
                    dispatch({ type: 'updatePreviousReturn', patch: { refundRequested: false } });
                  }}
                  title='No'
                  description={`Va en tu casilla 131: ${formatCurrency(record.balanceInFavor)} que se descuentan.`}
                />
                <OptionCard
                  name='refundRequested'
                  value='yes'
                  selectedValue={record.refundRequested === null ? '' : record.refundRequested ? 'yes' : 'no'}
                  onSelect={() => {
                    dispatch({ type: 'updatePreviousReturn', patch: { refundRequested: true } });
                  }}
                  title='Sí'
                  description='Ya lo usaste, así que no se lleva a este año.'
                />
              </div>
            </div>
          )}
          <MoneyField
            name='previousNetAssets'
            label='Total patrimonio líquido (casilla 31)'
            value={data.filing.previousNetAssets}
            onChange={previousNetAssets => {
              updateData(current => ({ ...current, filing: { ...current.filing, previousNetAssets } }));
            }}
            origin={fromReturn('netAssets', data.filing.previousNetAssets)}
            hint='Solo lo usamos si presentas tarde y no tienes ingresos ni impuesto.'
          />
          <div>
            <Button
              variant='ghost'
              icon={LuTrash2}
              onClick={() => {
                setError(null);
                dispatch({ type: 'clearPreviousReturn' });
              }}
            >
              Quitar la declaración del año pasado
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
