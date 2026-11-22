import { useState } from 'react';
import { LuCalendar, LuLandmark, LuPencil, LuScale, LuTrash2, LuWallet } from 'react-icons/lu';
import { Switch } from 'polpo/components';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { isPreviousReturnGiven, PreviousReturnError } from '@/domain/previous-return';
import type { PreviousReturnValues } from '@/domain/previous-return';
import { AmountList, AmountRow, Button, FileDropzone, Text } from '@/shared/ui';

import { readPreviousReturn } from './read-previous-return';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FROM_RETURN = 'Desde tu declaración';

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
        <>
          <AmountList>
            <AmountRow
              icon={LuLandmark}
              label='Total patrimonio líquido (casilla 31)'
              detail='Solo lo usamos si presentas tarde y no tienes ingresos ni impuesto'
              name='previousNetAssets'
              value={data.filing.previousNetAssets}
              onChange={previousNetAssets => {
                updateData(current => ({ ...current, filing: { ...current.filing, previousNetAssets } }));
              }}
              origin={fromReturn('netAssets', data.filing.previousNetAssets)}
            />
            <AmountRow
              icon={LuScale}
              label='Impuesto neto de renta (casilla 126)'
              detail='Con él calculamos el anticipo de este año, con el promedio de los dos últimos años'
              name='previousNetTax'
              value={data.general.previousYearNetTax}
              onChange={previousYearNetTax => {
                updateData(current => ({ ...current, general: { ...current.general, previousYearNetTax } }));
              }}
              origin={fromReturn('netTax', data.general.previousYearNetTax)}
            />
            <AmountRow
              icon={LuCalendar}
              label='Anticipo renta para el año gravable siguiente (casilla 133)'
              detail={`Es el anticipo que ya liquidaste para ${String(taxYear.year)}: va en tu casilla 130 y se descuenta`}
              name='previousAdvance'
              value={data.previousYearAdvance}
              onChange={previousYearAdvance => {
                updateData(current => ({ ...current, previousYearAdvance }));
              }}
              origin={fromReturn('advance', data.previousYearAdvance)}
            />
            <AmountRow
              icon={LuWallet}
              label='Total saldo a favor (casilla 137)'
              detail={
                record.balanceInFavor > 0 && record.refundRequested
                  ? 'Ya lo usaste, así que no se lleva a tu casilla 131'
                  : 'Va en tu casilla 131 si no pediste que te lo devolvieran o compensaran'
              }
              name='previousBalanceInFavor'
              value={record.balanceInFavor}
              onChange={balanceInFavor => {
                dispatch({ type: 'updatePreviousReturn', patch: { balanceInFavor } });
              }}
              origin={fromReturn('balanceInFavor', record.balanceInFavor)}
            >
              {/* Only asked when there is a balance in favor to carry (ADR 0050). */}
              {record.balanceInFavor > 0 && (
                <div
                  role='group'
                  aria-labelledby='refund-question'
                  className='flex flex-col items-start gap-1.5 pt-1.5 max-xl:flex-row max-xl:items-center max-xl:justify-between max-xl:gap-4'
                >
                  <Text id='refund-question' variant='caption' className='text-fg'>
                    ¿Pediste que la DIAN te lo devolviera o compensara?
                  </Text>
                  <Switch
                    name='refundRequested'
                    value={record.refundRequested}
                    setValue={refundRequested => {
                      dispatch({ type: 'updatePreviousReturn', patch: { refundRequested } });
                    }}
                    leftLabel='No'
                    rightLabel='Sí'
                    size='small'
                    width='large'
                    color='primary'
                  />
                </div>
              )}
            </AmountRow>
          </AmountList>
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
        </>
      )}
    </section>
  );
};
