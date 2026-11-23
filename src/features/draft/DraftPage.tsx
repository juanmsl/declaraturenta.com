import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { FORM_210_PATH } from '@/app/flow';
import { formatCurrency } from '@/shared/lib/format';
import { useIsCompact } from '@/shared/lib/use-compact';
import { Alert, Button, Chip, Text } from '@/shared/ui';

import { buildDraftRows } from './draft-rows';
import type { DraftOrigin } from './draft-rows';
import { PresentGuideDrawer } from './PresentGuideDrawer';

const OriginChip = ({ origin, box }: { origin: DraftOrigin; box: number }) => {
  switch (origin) {
    case 'exogenous':
      return <Chip variant='exogenous'>Desde exógena</Chip>;
    case 'user':
      return <Chip variant='box'>Lo ingresaste tú</Chip>;
    case 'box':
      return <Chip variant='box'>Casilla {box}</Chip>;
    case 'cap':
      return <Chip variant='cap'>Tope 40 %</Chip>;
    default:
      return null;
  }
};

/**
 * Screen 08 · Borrador 210 (Figma node 11:1213). Phones and tablets (M08, ADR 0060): one column, no
 * «Ver formato 210» and the rows do not open the 210, which needs a computer.
 */
export const DraftPage = () => {
  const navigate = useNavigate();
  const { taxYear } = useTaxYear();
  const { state, dispatch, result } = useDeclaration();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const rows = buildDraftRows(state.data, result);
  const isCompact = useIsCompact();

  const openBox = (box: number) => {
    void navigate(`${FORM_210_PATH}?casilla=${String(box)}`);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(false);
    try {
      const { downloadDraftPdf } = await import('./pdf/download-draft-pdf');
      await downloadDraftPdf(state.taxpayer, state.data, result, taxYear);
      dispatch({ type: 'completeStep', step: 'draft-210' });
    } catch {
      setDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const notice = downloadError ? (
    <Alert variant='error' title='No pudimos crear el PDF'>
      Intenta de nuevo en un momento. Tus datos siguen guardados.
    </Alert>
  ) : (
    <Alert variant='info' title='Esto es un borrador'>
      La declaración se presenta y firma en el portal de la DIAN con tu firma electrónica. Aquí solo la
      preparas y la revisas.
    </Alert>
  );

  const guide = (
    <PresentGuideDrawer
      isOpen={isGuideOpen}
      onClose={() => {
        setIsGuideOpen(false);
      }}
      onDownload={() => void handleDownload()}
      isDownloading={isDownloading}
    />
  );

  if (isCompact) {
    return (
      <div className='mx-auto flex w-full max-w-180 flex-col gap-6 px-4 pt-4 pb-8 md:px-8 md:pt-8'>
        <header className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Text variant='title-l' as='h1'>
              Tu borrador del Formulario 210
            </Text>
            <Text variant='body-m' className='text-fg-secondary'>
              Revisa cada renglón antes de llevarlo al portal de la DIAN.
            </Text>
          </div>
          <Button
            variant='secondary'
            className='w-full'
            onClick={() => void handleDownload()}
            isLoading={isDownloading}
          >
            Descargar PDF
          </Button>
          <Button
            icon={LuArrowRight}
            className='w-full'
            onClick={() => {
              setIsGuideOpen(true);
            }}
          >
            Cómo presentarlo en la DIAN
          </Button>
        </header>
        {notice}
        <div className='overflow-hidden rounded-lg border border-line bg-surface'>
          <div className='flex gap-4 border-b border-line px-5 py-2.5'>
            <Text variant='note' className='flex-1 text-fg-muted'>
              Concepto
            </Text>
            <Text variant='note' className='text-right text-fg-muted'>
              Valor
            </Text>
          </div>
          {rows.map((row, index) => {
            if (row.type === 'section') {
              return (
                <div key={row.label} className='bg-subtle px-5 py-2'>
                  <Text variant='caption' as='h2' className='text-fg-secondary'>
                    {row.label}
                  </Text>
                </div>
              );
            }
            const isTotal = row.type === 'total';
            const chip = row.type === 'line' ? <OriginChip origin={row.origin} box={row.box} /> : null;
            const value = (
              <Text as='span' variant={isTotal ? 'figure-l' : 'figure-m'} className='shrink-0 text-right'>
                {formatCurrency(row.value)}
              </Text>
            );
            const label = (
              <Text
                as='span'
                variant={isTotal || row.strong === true ? 'body-m-strong' : 'body-m'}
                className='min-w-0'
              >
                {row.label}
              </Text>
            );
            const hasChip = row.type === 'line' && row.origin !== null;
            return (
              <div
                key={`${String(row.box)}-${String(index)}`}
                className={cn(
                  'flex border-b border-line px-5 last:border-b-0',
                  isTotal ? cn('py-3.5', row.toPay ? 'bg-coral-soft' : 'bg-mint-soft') : 'py-3',
                )}
              >
                {hasChip ? (
                  <span className='flex w-full flex-col gap-1.5'>
                    {label}
                    <span className='flex items-center justify-between gap-3'>
                      {chip}
                      {value}
                    </span>
                  </span>
                ) : (
                  <span className='flex w-full items-center justify-between gap-3'>
                    <span className='min-w-0 flex-1'>{label}</span>
                    {value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {guide}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5 px-14 py-9'>
      <header className='flex items-end gap-4'>
        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          <Text variant='title-l' as='h1'>
            Tu borrador del Formulario 210
          </Text>
          <Text variant='body-m' className='max-w-110 text-fg-secondary'>
            Revisa cada renglón antes de llevarlo al portal de la DIAN. Toca una cifra para ver de dónde sale.
          </Text>
        </div>
        <Button variant='ghost' onClick={() => void navigate(FORM_210_PATH)}>
          Ver formato 210
        </Button>
        <Button variant='secondary' onClick={() => void handleDownload()} isLoading={isDownloading}>
          Descargar PDF
        </Button>
        <Button
          icon={LuArrowRight}
          onClick={() => {
            setIsGuideOpen(true);
          }}
        >
          Cómo presentarlo en la DIAN
        </Button>
      </header>

      {notice}

      <div className='overflow-hidden rounded-lg border border-line bg-surface'>
        <div className='flex gap-4 border-b border-line px-6 py-2.5'>
          <Text variant='note' className='flex-1 text-fg-muted'>
            Concepto
          </Text>
          <Text variant='note' className='w-37.5 text-fg-muted'>
            Origen
          </Text>
          <Text variant='note' className='w-37.5 text-right text-fg-muted'>
            Valor
          </Text>
        </div>
        {rows.map((row, index) => {
          if (row.type === 'section') {
            return (
              <div key={row.label} className='bg-subtle px-6 py-2'>
                <Text variant='caption' as='h2' className='text-fg-secondary'>
                  {row.label}
                </Text>
              </div>
            );
          }
          const isTotal = row.type === 'total';
          return (
            <button
              key={`${String(row.box)}-${String(index)}`}
              type='button'
              onClick={() => {
                openBox(row.box);
              }}
              aria-label={`${row.label}: ${formatCurrency(row.value)}. Ver casilla ${String(row.box)}`}
              className={cn(
                'flex w-full cursor-pointer items-center gap-4 border-b border-line px-6 text-left transition-colors focus-visible:outline-none',
                isTotal
                  ? cn('py-3.5', row.toPay ? 'bg-coral-soft' : 'bg-mint-soft', 'hover:brightness-[0.98]')
                  : 'py-2.25 hover:bg-canvas focus-visible:bg-canvas',
              )}
            >
              <Text
                as='span'
                variant={isTotal || row.strong === true ? 'body-m-strong' : 'body-m'}
                className='min-w-0 flex-1'
              >
                {row.label}
              </Text>
              <span className='flex w-37.5 shrink-0'>
                {row.type === 'line' && <OriginChip origin={row.origin} box={row.box} />}
              </span>
              <Text
                as='span'
                variant={isTotal ? 'figure-l' : 'figure-m'}
                className='w-37.5 shrink-0 text-right'
              >
                {formatCurrency(row.value)}
              </Text>
            </button>
          );
        })}
      </div>

      {guide}
    </div>
  );
};
