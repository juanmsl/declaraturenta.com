import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { Switch } from 'polpo/components';
import { LuChevronDown } from 'react-icons/lu';

import { BrandLink } from '@/app/layout/BrandLink';
import { MobileTopBar } from '@/app/layout/MobileTopBar';
import { useFlowProgress } from '@/app/layout/useFlowProgress';
import { CopyMenu } from '@/app/layout/CopyMenu';
import { HelpButton } from '@/app/layout/HelpButton';
import { ViewSwitcher } from '@/app/layout/ViewSwitcher';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { useAppPageMeta } from '@/app/seo/use-page-meta';
import { isCountBox } from '@/domain/box-concepts';
import type { FilingCount } from '@/domain/advance-payment';
import { buildForm210, OTHER_SCHEDULES, SCHEDULE_COLUMNS, SCHEDULE_ROWS } from '@/domain/form-210';
import type { Form210, Form210Box } from '@/domain/form-210';
import { useIsCompact } from '@/shared/lib/use-compact';
import { BoxField, Button, Icon, MoneyField, SelectField, Text, TextField } from '@/shared/ui';

import { BoxDetailDrawer } from './BoxDetailDrawer';
import { BOX_SECTIONS } from './sections';

const FILING_COUNT_OPTIONS: readonly { value: FilingCount; label: string }[] = [
  { value: 'first', label: 'Primera vez' },
  { value: 'second', label: 'Segunda vez' },
  { value: 'third-or-more', label: 'Tercera vez o más' },
];

const LEGEND = [
  { label: 'Ingresada · abre el detalle', className: 'border border-line-strong bg-surface' },
  { label: 'Calculada · muestra su fórmula', className: 'border border-line-action bg-rail' },
  { label: 'No aplica en tu caso', className: 'bg-subtle' },
  { label: 'Saldo a favor', className: 'border border-line-success bg-mint-soft' },
  { label: 'Saldo a pagar', className: 'border border-line-error bg-coral-soft' },
];

/** Column of the general schedule that holds a box, or 0. */
const columnOf = (box: number | null): number => {
  if (box === null) return 0;
  const row = SCHEDULE_ROWS.find(item => item.boxes.includes(box));
  return row ? Math.max(row.boxes.indexOf(box), 0) : 0;
};

/** Id of the content of a section, for «aria-controls» and «Ir a la casilla». */
const sectionIdOf = (title: string) => `seccion-${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gu, '-')}`;

const sectionTitleOf = (box: number): string | undefined =>
  BOX_SECTIONS.find(section => box >= section.from && box <= section.to)?.title;

/**
 * Screen 09 · Formulario 210 (Figma node 18:1572) with the box detail of 09b (19:2267). Phones and
 * tablets (Figma M09–M09b, ADR 0061): sections that open one by one, the general schedule by kind
 * of income, «Ir a la casilla» and the detail from the bottom.
 */
export const Form210Page = () => {
  useAppPageMeta('Formulario 210');
  const { taxYear } = useTaxYear();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, result } = useDeclaration();
  const [isDownloading, setIsDownloading] = useState(false);
  const form = buildForm210(state.data, result, taxYear);
  const selectedParam = Number(searchParams.get('casilla'));
  const selected = form.get(selectedParam)?.kind === 'entered' ? selectedParam : null;
  const focusBox = form.has(selectedParam) ? selectedParam : null;

  // Only a link from another screen (e.g. «Ver en el 210») scrolls to its box, once, on arrival.
  // Opening or closing a box here keeps the scroll where it is (ADR 0046).
  const [arrivalBox] = useState(focusBox);
  useEffect(() => {
    if (arrivalBox === null) return;
    // Next frame: after ScrollRestoration has taken a new page to the top (ADR 0043).
    const frame = requestAnimationFrame(() => {
      document.getElementById(`casilla-${String(arrivalBox)}`)?.scrollIntoView({ block: 'center' });
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [arrivalBox]);

  const isCompact = useIsCompact();
  const { steps } = useFlowProgress();
  const [openSections, setOpenSections] = useState<ReadonlySet<string>>(() => {
    const title = focusBox === null ? undefined : sectionTitleOf(focusBox);
    return new Set(title ? [title] : []);
  });
  const [column, setColumn] = useState(() => columnOf(focusBox));
  const [highlight, setHighlight] = useState<number | null>(null);
  const [pendingScroll, setPendingScroll] = useState<number | null>(null);

  useEffect(() => {
    if (pendingScroll === null) return;
    const frame = requestAnimationFrame(() => {
      // A box of an inactive schedule is not on the page: show its section instead.
      const target =
        document.getElementById(`casilla-${String(pendingScroll)}`) ??
        document.getElementById(sectionIdOf(sectionTitleOf(pendingScroll) ?? ''));
      target?.scrollIntoView({ block: 'center' });
      setPendingScroll(null);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pendingScroll]);

  const toggleSection = (title: string) => {
    setOpenSections(current => {
      const next = new Set(current);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  /** «Ir a la casilla»: opens its section (and its column) and brings it into view. */
  const goToBox = (number: number) => {
    const title = sectionTitleOf(number);
    if (title) setOpenSections(current => new Set([...current, title]));
    if (SCHEDULE_ROWS.some(row => row.boxes.includes(number))) setColumn(columnOf(number));
    setHighlight(number);
    setPendingScroll(number);
  };

  const openBox = (box: Form210Box) => {
    setSearchParams({ casilla: String(box.number) }, { replace: true, preventScrollReset: true });
  };

  const closeBox = () => {
    setSearchParams({}, { replace: true, preventScrollReset: true });
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
            selected === number ||
            highlight === number ||
            (selected === null && focusBox === number && item.kind !== 'entered')
          }
          onOpen={openBox}
          isCount={isCountBox(number)}
        />
      </div>
    );
  };

  const sectionProps = (title: string, compactNote?: string) => {
    const section = BOX_SECTIONS.find(item => item.title === title);
    return {
      title,
      compact: isCompact
        ? {
            isOpen: openSections.has(title),
            onToggle: () => {
              toggleSection(title);
            },
            note: compactNote ?? (section ? `Casillas ${String(section.from)} a ${String(section.to)}` : ''),
          }
        : undefined,
    };
  };

  const sections = (
    <>
      <Section
        {...sectionProps(
          'Datos generales',
          'Cuántas veces has declarado, impuesto del año pasado y casilla 28',
        )}
      >
        <div className='grid grid-cols-4 gap-4 max-xl:grid-cols-1'>
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

      <Section
        {...sectionProps('Patrimonio', `Al 31 de diciembre de ${String(taxYear.year)} · casillas 29 a 31`)}
        note={`Al 31 de diciembre de ${String(taxYear.year)}`}
      >
        <BoxGrid form={form} rows={[[29, 30, 31]]} render={box} compact={isCompact} />
      </Section>

      <Section {...sectionProps('Cédula general', 'Casillas 32 a 90 · elige el tipo de renta')}>
        {isCompact ? (
          <ScheduleColumn column={column} onColumnChange={setColumn} render={box} />
        ) : (
          <ScheduleMatrix render={box} />
        )}
      </Section>

      <Section {...sectionProps('Renta líquida gravable de la cédula general')}>
        <BoxGrid
          form={form}
          rows={[
            [91, 92, 93, 94],
            [95, 96, 97, 98],
          ]}
          render={box}
          compact={isCompact}
        />
      </Section>

      <Section {...sectionProps('Otras cédulas', 'Pensiones, dividendos y ganancias ocasionales')}>
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
                  <Switch
                    name={schedule.id}
                    value={isActive}
                    setValue={toggle}
                    color='primary'
                    size='small'
                    width='large'
                  />
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
                    className='cursor-pointer rounded-sm text-fg-action hover:underline focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none max-xl:hidden'
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
                    compact={isCompact}
                  />
                )}
              </div>
            );
          })}
          {box(111)}
        </div>
      </Section>

      <Section {...sectionProps('Impuesto sobre las rentas líquidas gravables')}>
        <BoxGrid
          form={form}
          rows={[
            [116, 117, 118, 119],
            [120, 121],
          ]}
          render={box}
          compact={isCompact}
        />
      </Section>

      <Section {...sectionProps('Descuentos tributarios')}>
        <BoxGrid form={form} rows={[[122, 123, 124, 125]]} render={box} compact={isCompact} />
      </Section>

      <Section {...sectionProps('Liquidación privada')}>
        <BoxGrid
          form={form}
          rows={[
            [126, 127, 128, 129],
            [130, 131, 132, 133],
          ]}
          render={box}
          compact={isCompact}
        />
      </Section>

      <Section {...sectionProps('Saldo')}>
        <BoxGrid
          form={form}
          rows={[
            [134, 135, 136, 137],
            [138, 139, 140, 141],
          ]}
          render={box}
          compact={isCompact}
        />
      </Section>
    </>
  );

  const detail = <BoxDetailDrawer form={form} boxNumber={selected} onClose={closeBox} />;

  if (isCompact) {
    return (
      <div className='min-h-dvh overflow-x-clip bg-canvas'>
        <MobileTopBar steps={steps} currentStep={undefined} location='Formulario 210' />
        <div className='mx-auto w-full max-w-180 px-4 pt-1.5 md:px-8 md:pt-3'>
          <ViewSwitcher view='form-210' />
        </div>
        <main className='mx-auto flex w-full max-w-180 flex-col gap-5 px-4 pt-4 pb-8 md:px-8 md:pt-8'>
          <header className='flex flex-col gap-2.5'>
            <Text variant='title-l' as='h1'>
              Formulario 210 · Año gravable {taxYear.year}
            </Text>
            <Text variant='body-m' className='text-fg-secondary'>
              Toda tu declaración con la estructura oficial de la DIAN. Toca una casilla con flecha para ver
              qué conceptos suman; las demás muestran su fórmula.
            </Text>
          </header>
          <Button
            variant='secondary'
            className='w-full'
            onClick={() => void handleDownload()}
            isLoading={isDownloading}
          >
            Descargar PDF
          </Button>
          <GoToBox form={form} onGo={goToBox} />
          <ul className='flex flex-wrap gap-x-3 gap-y-2' aria-label='Leyenda'>
            {LEGEND.map(item => (
              <li key={item.label} className='flex items-center gap-2'>
                <span aria-hidden className={cn('h-4.5 w-7 rounded-[5px]', item.className)} />
                <Text as='span' variant='note' className='text-fg-secondary'>
                  {item.label}
                </Text>
              </li>
            ))}
          </ul>
          {sections}
        </main>
        {detail}
      </div>
    );
  }

  return (
    <div className='min-h-dvh min-w-7xl bg-canvas'>
      <header className='sticky top-0 z-10 flex h-18 items-center gap-6 border-b border-line bg-surface pr-8 pl-10'>
        <BrandLink />
        <ViewSwitcher view='form-210' />
        <div className='flex-1' />
        <Text variant='note' className='text-fg-muted'>
          {state.taxpayer.fullName}
        </Text>
        <Button variant='secondary' onClick={() => void handleDownload()} isLoading={isDownloading}>
          Descargar PDF
        </Button>
        <CopyMenu />
        <HelpButton />
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

        {sections}
      </main>

      {detail}
    </div>
  );
};

type SectionCompact = { isOpen: boolean; onToggle: () => void; note: string };

const SectionMark = () => (
  <svg width={12} height={12} viewBox='0 0 12 12' aria-hidden className='shrink-0 fill-sun'>
    <path d='M6 0 12 6 6 12 0 6Z' />
  </svg>
);

const Section = ({
  title,
  note,
  compact,
  children,
}: {
  title: string;
  note?: string;
  /** Phones and tablets: a card that opens and closes (Figma M09). */
  compact?: SectionCompact;
  children: ReactNode;
}) => {
  const id = sectionIdOf(title);
  if (compact) {
    return (
      <section className='flex flex-col rounded-lg border border-line bg-surface'>
        <h2 className='m-0'>
          <button
            type='button'
            aria-expanded={compact.isOpen}
            aria-controls={id}
            onClick={compact.onToggle}
            className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-line-action'
          >
            <SectionMark />
            <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <Text as='span' variant='title-s'>
                {title}
              </Text>
              <Text as='span' variant='note' className='text-fg-muted'>
                {compact.note}
              </Text>
            </span>
            <Icon
              icon={LuChevronDown}
              size={18}
              className={cn('shrink-0 text-fg-action transition-transform', compact.isOpen && 'rotate-180')}
            />
          </button>
        </h2>
        {compact.isOpen && (
          <div id={id} className='flex flex-col gap-4 px-4 pb-4'>
            {children}
          </div>
        )}
      </section>
    );
  }
  return (
    <section className='flex flex-col gap-5'>
      <div className='flex items-center gap-3'>
        <SectionMark />
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
};

/** «Ir a la casilla» (Figma M09): goes to a box as soon as its number is complete. */
const GoToBox = ({ form, onGo }: { form: Form210; onGo: (number: number) => void }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );

  const handleChange = (next: string) => {
    const digits = next.replace(/\D/gu, '').slice(0, 3);
    setValue(digits);
    setError(undefined);
    window.clearTimeout(timer.current);
    if (digits.length < 2) return;
    const number = Number(digits);
    timer.current = window.setTimeout(() => {
      // Two digits below 28 can still become a three-digit box (100–141).
      if (form.has(number)) onGo(number);
      else if (digits.length === 3 || number >= 28)
        setError(`El Formulario 210 no tiene la casilla ${digits}.`);
    }, 400);
  };

  return (
    <TextField
      name='go-to-box'
      label='Ir a la casilla'
      value={value}
      onChange={handleChange}
      placeholder='Escribe el número, por ejemplo 32'
      error={error}
    />
  );
};

const BoxGrid = ({
  rows,
  render,
  compact = false,
}: {
  form: Form210;
  rows: number[][];
  render: (number: number) => ReactNode;
  /** One box per line on phones and tablets. */
  compact?: boolean;
}) =>
  compact ? (
    <div className='flex flex-col gap-4'>
      {rows.flat().map(number => (
        <div key={number}>{render(number)}</div>
      ))}
    </div>
  ) : (
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

/** Short names of the four income columns for the phone selector. */
const COLUMN_SHORT_NAMES = ['Trabajo', 'Honorarios', 'Capital', 'No laborales'] as const;

/** General schedule on phones and tablets: one kind of income at a time (Figma M09a). */
const ScheduleColumn = ({
  column,
  onColumnChange,
  render,
}: {
  column: number;
  onColumnChange: (column: number) => void;
  render: (number: number, showLabel?: boolean) => ReactNode;
}) => {
  const rows = SCHEDULE_ROWS.filter(row => row.boxes[column] !== null);
  return (
    <div className='flex flex-col gap-4'>
      <div role='group' aria-label='Tipo de renta' className='flex gap-0.5 rounded-xl bg-subtle p-1'>
        {COLUMN_SHORT_NAMES.map((name, index) => {
          const isActive = index === column;
          return (
            <Button
              key={name}
              type='button'
              variant='ghost'
              aria-pressed={isActive}
              aria-label={SCHEDULE_COLUMNS[index]}
              onClick={() => {
                onColumnChange(index);
              }}
              className={cn(
                'min-w-0 flex-1 rounded-[0.5625rem] px-1 py-2 type-caption text-fg-secondary hover:bg-surface/60',
                isActive && 'bg-surface text-fg shadow-raised hover:bg-surface',
              )}
            >
              {name}
            </Button>
          );
        })}
      </div>
      {rows.map((row, index) => {
        const number = row.boxes[column];
        if (number === null || number === undefined) return null;
        const groupLabel = row.group !== rows[index - 1]?.group ? row.group : undefined;
        return (
          <div key={row.label} className='flex flex-col gap-4'>
            {groupLabel && (
              <Text variant='caption' className='text-fg-muted'>
                {groupLabel}
              </Text>
            )}
            {render(number)}
          </div>
        );
      })}
    </div>
  );
};

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
