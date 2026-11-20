import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Switch } from 'polpo/components';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { getStep } from '@/app/flow';
import { useAppPageMeta } from '@/app/seo/use-page-meta';
import { isCountBox } from '@/domain/box-concepts';
import type { FilingCount } from '@/domain/advance-payment';
import { buildForm210, OTHER_SCHEDULES, SCHEDULE_COLUMNS, SCHEDULE_ROWS } from '@/domain/form-210';
import type { Form210, Form210Box } from '@/domain/form-210';
import { BoxField, Button, MoneyField, SelectField, Text } from '@/shared/ui';

import { BoxDetailDrawer } from './BoxDetailDrawer';

const draftStep = getStep('draft-210');

const FILING_COUNT_OPTIONS: readonly { value: FilingCount; label: string }[] = [
  { value: 'first', label: 'Primera vez' },
  { value: 'second', label: 'Segunda vez' },
  { value: 'third-or-more', label: 'Tercera vez o más' },
];

const LEGEND = [
  { label: 'Ingresada · abre el detalle', className: 'border border-line-strong bg-surface' },
  { label: 'Calculada · muestra su fórmula', className: 'bg-rail' },
  { label: 'No aplica en tu caso', className: 'bg-subtle' },
  { label: 'Resultado final', className: 'border border-line-success bg-mint-soft' },
];

/** Screen 09 · Formulario 210 (Figma node 18:1572) with the box detail of 09b (19:2267). */
export const Form210Page = () => {
  useAppPageMeta('Formulario 210');
  const { taxYear } = useTaxYear();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, result } = useDeclaration();
  const [isDownloading, setIsDownloading] = useState(false);
  const form = buildForm210(state.data, result, taxYear);
  const selectedParam = Number(searchParams.get('casilla'));
  const selected = form.get(selectedParam)?.kind === 'entered' ? selectedParam : null;
  const focusBox = form.has(selectedParam) ? selectedParam : null;

  useEffect(() => {
    if (focusBox === null) return;
    document.getElementById(`casilla-${String(focusBox)}`)?.scrollIntoView({ block: 'center' });
  }, [focusBox]);

  const openBox = (box: Form210Box) => {
    setSearchParams({ casilla: String(box.number) }, { replace: true });
  };

  const closeBox = () => {
    setSearchParams({}, { replace: true });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { downloadDraftPdf } = await import('@/features/draft/pdf/download-draft-pdf');
      await downloadDraftPdf(state.taxpayer, state.data, result, taxYear);
    } finally {
      setIsDownloading(false);
    }
  };

  const box = (number: number, showLabel = true) => {
    const item = form.get(number);
    if (!item) return <div />;
    return (
      <div id={`casilla-${String(number)}`} className='scroll-mt-28'>
        <BoxField
          box={item}
          showLabel={showLabel}
          isSelected={
            selected === number || (selected === null && focusBox === number && item.kind !== 'entered')
          }
          onOpen={openBox}
          isCount={isCountBox(number)}
        />
      </div>
    );
  };

  return (
    <div className='min-h-dvh min-w-7xl bg-canvas'>
      <header className='sticky top-0 z-10 flex h-18 items-center gap-4 border-b border-line bg-surface pr-30 pl-26'>
        <Button variant='ghost' onClick={() => void navigate(draftStep.path)}>
          Volver al borrador
        </Button>
        <div className='flex-1' />
        <Text variant='note' className='text-fg-muted'>
          {state.taxpayer.fullName}
        </Text>
        <Button variant='secondary' onClick={() => void handleDownload()} isLoading={isDownloading}>
          Descargar PDF
        </Button>
      </header>

      <main className='mx-auto flex max-w-300 flex-col gap-12 pt-12 pb-24'>
        <div className='flex items-end gap-8'>
          <div className='flex min-w-0 flex-1 flex-col gap-2.5'>
            <Text variant='title-l' as='h1'>
              Formulario 210 · Año gravable {taxYear.year}
            </Text>
            <Text variant='body-m' className='text-fg-secondary'>
              Toda tu declaración con la estructura oficial de la DIAN. Las casillas con flecha las llenaste
              tú o vienen de tu exógena: tócalas para ver qué conceptos suman. Las demás se calculan solas y
              muestran su fórmula.
            </Text>
          </div>
          <ul
            className='flex shrink-0 flex-col gap-2 rounded-lg border border-line bg-surface p-4'
            aria-label='Leyenda'
          >
            {LEGEND.map(item => (
              <li key={item.label} className='flex items-center gap-2.5'>
                <span aria-hidden className={cn('h-4.5 w-7 rounded-[5px]', item.className)} />
                <Text as='span' variant='note' className='text-fg-secondary'>
                  {item.label}
                </Text>
              </li>
            ))}
          </ul>
        </div>

        <Section title='Datos generales'>
          <div className='grid grid-cols-4 gap-4'>
            <SelectField
              name='filingCount'
              label='Estoy declarando por'
              size='compact'
              value={state.data.general.filingCount}
              options={FILING_COUNT_OPTIONS}
              onChange={filingCount => {
                dispatch({
                  type: 'updateData',
                  update: data => ({ ...data, general: { ...data.general, filingCount } }),
                });
              }}
            />
            <MoneyField
              name='previousYearNetTax'
              label={`Impuesto neto de renta de tu declaración ${String(taxYear.year - 1)}`}
              size='compact'
              value={state.data.general.previousYearNetTax}
              onChange={previousYearNetTax => {
                dispatch({
                  type: 'updateData',
                  update: data => ({ ...data, general: { ...data.general, previousYearNetTax } }),
                });
              }}
            />
            {box(28)}
          </div>
        </Section>

        <Section title='Patrimonio' note={`Al 31 de diciembre de ${String(taxYear.year)}`}>
          <BoxGrid form={form} rows={[[29, 30, 31]]} render={box} />
        </Section>

        <Section title='Cédula general'>
          <ScheduleMatrix render={box} />
        </Section>

        <Section title='Renta líquida gravable de la cédula general'>
          <BoxGrid
            form={form}
            rows={[
              [91, 92, 93, 94],
              [95, 96, 97, 98],
            ]}
            render={box}
          />
        </Section>

        <Section title='Otras cédulas'>
          <div className='flex flex-col gap-5'>
            {OTHER_SCHEDULES.map(schedule => {
              const isActive = state.activeSchedules.includes(schedule.id);
              const toggle = () => {
                dispatch({ type: 'toggleSchedule', scheduleId: schedule.id });
              };
              return (
                <div
                  key={schedule.id}
                  className='toggle-field flex flex-col gap-3 rounded-lg border border-line bg-surface px-5 py-4'
                >
                  <div className='flex items-center gap-4'>
                    <Switch name={schedule.id} value={isActive} setValue={toggle} />
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <Text variant='body-m-strong'>{schedule.title}</Text>
                      <Text variant='note' className='text-fg-muted'>
                        Casillas {schedule.fromBox} a {schedule.toBox}
                        {isActive ? '' : ` · ${schedule.emptyNote} en ${String(taxYear.year)}`}
                      </Text>
                    </div>
                    <button
                      type='button'
                      onClick={toggle}
                      className='cursor-pointer rounded-sm text-fg-action hover:underline focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
                    >
                      <Text as='span' variant='caption' className='text-current'>
                        {isActive ? 'Desactivar' : 'Activar'}
                      </Text>
                    </button>
                  </div>
                  {isActive && (
                    <BoxGrid
                      form={form}
                      rows={chunk(range(schedule.fromBox, schedule.toBox), 4)}
                      render={box}
                    />
                  )}
                </div>
              );
            })}
            {box(111)}
          </div>
        </Section>

        <Section title='Impuesto sobre las rentas líquidas gravables'>
          <BoxGrid
            form={form}
            rows={[
              [116, 117, 118, 119],
              [120, 121],
            ]}
            render={box}
          />
        </Section>

        <Section title='Descuentos tributarios'>
          <BoxGrid form={form} rows={[[122, 123, 124, 125]]} render={box} />
        </Section>

        <Section title='Liquidación privada'>
          <BoxGrid
            form={form}
            rows={[
              [126, 127, 128, 129],
              [130, 131, 132, 133],
            ]}
            render={box}
          />
        </Section>

        <Section title='Saldo'>
          <BoxGrid
            form={form}
            rows={[
              [134, 135, 136, 137],
              [138, 139, 140, 141],
            ]}
            render={box}
          />
        </Section>
      </main>

      <BoxDetailDrawer form={form} boxNumber={selected} onClose={closeBox} />
    </div>
  );
};

const Section = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <section className='flex flex-col gap-5'>
    <div className='flex items-center gap-3'>
      <svg width={12} height={12} viewBox='0 0 12 12' aria-hidden className='shrink-0 fill-sun'>
        <path d='M6 0 12 6 6 12 0 6Z' />
      </svg>
      <Text variant='title-m' as='h2'>
        {title}
      </Text>
      {note && (
        <Text variant='note' className='text-fg-muted'>
          {note}
        </Text>
      )}
      <span aria-hidden className='h-px flex-1 bg-subtle' />
    </div>
    {children}
  </section>
);

const BoxGrid = ({
  rows,
  render,
}: {
  form: Form210;
  rows: number[][];
  render: (number: number) => ReactNode;
}) => (
  <div className='flex flex-col gap-5'>
    {rows.map(row => (
      <div key={row.join('-')} className='grid grid-cols-4 items-start gap-4'>
        {row.map(number => (
          <div key={number}>{render(number)}</div>
        ))}
      </div>
    ))}
  </div>
);

const ScheduleMatrix = ({ render }: { render: (number: number, showLabel?: boolean) => ReactNode }) => {
  return (
    <div className='flex flex-col gap-3.5' role='table' aria-label='Cédula general por tipo de renta'>
      <div className='grid grid-cols-[14.5rem_repeat(4,minmax(0,1fr))] gap-4' role='row'>
        <span role='columnheader' />
        {SCHEDULE_COLUMNS.map(column => (
          <Text
            key={column}
            role='columnheader'
            variant='body-m-strong'
            className='flex h-10 items-center justify-center rounded-full bg-action-soft text-fg-action'
          >
            {column}
          </Text>
        ))}
      </div>
      {SCHEDULE_ROWS.map((row, rowIndex) => {
        const groupLabel = row.group !== SCHEDULE_ROWS[rowIndex - 1]?.group ? row.group : undefined;
        return (
          <div key={row.label} className='flex flex-col gap-3.5'>
            {groupLabel && (
              <div className='flex items-center gap-3 pt-2'>
                <Text variant='caption' className='text-fg-muted'>
                  {groupLabel}
                </Text>
                <span aria-hidden className='h-px flex-1 bg-subtle' />
              </div>
            )}
            <div className='grid grid-cols-[14.5rem_repeat(4,minmax(0,1fr))] items-start gap-4' role='row'>
              <Text variant='body-m-strong' role='rowheader' className='pt-3'>
                {row.label}
              </Text>
              {row.boxes.map((number, index) => (
                <div key={number ?? `empty-${String(index)}`} role='cell'>
                  {number !== null && render(number, false)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

const chunk = (values: number[], size: number) =>
  Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, index * size + size),
  );
