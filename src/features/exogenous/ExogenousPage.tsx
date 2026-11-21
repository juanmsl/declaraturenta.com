import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { IconType } from 'react-icons';
import {
  LuArrowRight,
  LuBriefcase,
  LuCar,
  LuChartLine,
  LuCircleHelp,
  LuCoins,
  LuCreditCard,
  LuHouse,
  LuLandmark,
  LuReceipt,
  LuWallet,
} from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { getStep, HOME_PATH } from '@/app/flow';
import { buildExogenousReport, clearExogenous, countReportingEntities } from '@/domain/exogenous';
import type { ExogenousItem, ExogenousItemKind } from '@/domain/exogenous';
import { parseExogenousSheet } from '@/domain/exogenous-file';
import { formatCurrency } from '@/shared/lib/format';
import { Alert, Button, Chip, FileDropzone, Icon, NoteBox, StepHeader, StepLayout, Text } from '@/shared/ui';

import { PreviousReturnCard } from './PreviousReturnCard';
import { VatQuestion } from './VatQuestion';
import { YearMovementsSection } from './YearMovementsSection';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const assetsStep = getStep('assets');

/** Sections of "Esto encontramos", in order, with the kinds they show. */
const GROUPS: readonly { title: string; kinds: readonly ExogenousItemKind[] }[] = [
  {
    title: 'Ingresos',
    kinds: [
      'labor-income',
      'fees-income',
      'capital-income',
      'non-labor-income',
      'pension-income',
      'dividend',
      'occasional-gain',
    ],
  },
  {
    title: 'Aportes y retenciones',
    kinds: ['labor-non-taxable', 'other-non-taxable', 'voluntary-pension', 'withholding'],
  },
  { title: 'Patrimonio', kinds: ['asset', 'debt'] },
  {
    title: 'Deducciones y otros',
    kinds: ['housing-interest', 'prepaid-health', 'electronic-invoice', 'previous-balance'],
  },
];

const ICONS: Record<ExogenousItemKind, IconType> = {
  'labor-income': LuBriefcase,
  'labor-non-taxable': LuWallet,
  'other-non-taxable': LuWallet,
  'voluntary-pension': LuWallet,
  withholding: LuReceipt,
  'capital-income': LuChartLine,
  'non-labor-income': LuCoins,
  'fees-income': LuBriefcase,
  'pension-income': LuWallet,
  dividend: LuChartLine,
  'occasional-gain': LuCoins,
  asset: LuLandmark,
  debt: LuCreditCard,
  'housing-interest': LuHouse,
  'prepaid-health': LuReceipt,
  'previous-balance': LuReceipt,
  'electronic-invoice': LuReceipt,
  informative: LuReceipt,
};

const REVIEW_TEXT = {
  duplicate:
    'Tu empleador y tu fondo reportaron el mismo aporte voluntario. Lo tomamos una sola vez; confírmalo con tus certificados.',
  vehicle:
    'La DIAN reporta el avalúo del vehículo, pero en tu declaración va su costo fiscal (lo que pagaste). Lo podrás corregir en Patrimonio.',
  housing:
    'Compara los intereses de vivienda con el certificado de tu banco antes de usarlos como deducción.',
  dividend:
    'Los dividendos de utilidades de 2016 y antes pueden ser gravados o no. Confírmalo con el certificado de la empresa y corrígelo en Ingresos.',
  'occasional-gain':
    'Elige en Ingresos qué tipo de ganancia ocasional fue (herencia, venta, lotería…) para calcular la parte exenta.',
} as const;

/** Lines with the same kind, concept and entity are shown together (e.g. several CDT yields). */
const groupItems = (items: readonly ExogenousItem[]): ExogenousItem[] => {
  const grouped = new Map<string, ExogenousItem>();
  for (const item of items) {
    const key = `${item.kind}|${item.label}|${item.entity}`;
    const current = grouped.get(key);
    grouped.set(key, current ? { ...current, amount: current.amount + item.amount } : { ...item });
  }
  return [...grouped.values()];
};

/** Screen 03 · Importar exógena (Figma node 9:448). Reads the DIAN .xlsx in the browser (ADR 0024). */
export const ExogenousPage = () => {
  const { taxYear } = useTaxYear();
  const navigate = useNavigate();
  const { state, dispatch } = useDeclaration();
  const { exogenous } = state;
  const { report } = exogenous;
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  const visibleItems = report.items.filter(item => item.kind !== 'informative' && item.amount > 0);
  const isConfirmed = (item: ExogenousItem) => !item.review || exogenous.confirmedItems.includes(item.id);
  const pendingItems = visibleItems.filter(item => !isConfirmed(item));

  const handleFile = async (file: File) => {
    setError(null);
    setIsReading(true);
    try {
      const { readSheet } = await import('read-excel-file/browser');
      const parsed = parseExogenousSheet(await readSheet(file));
      if (parsed.year !== null && parsed.year !== taxYear.year) {
        setError(
          `Este reporte es del año ${String(parsed.year)}. Descarga el del año gravable ${String(taxYear.year)}.`,
        );
        return;
      }
      dispatch({ type: 'importExogenous', report: buildExogenousReport(parsed, file.name) });
    } catch {
      setError(
        'No pudimos leer este archivo como un reporte de exógena de la DIAN. Descárgalo de nuevo en Excel (.xlsx).',
      );
    } finally {
      setIsReading(false);
    }
  };

  const handleUseData = () => {
    pendingItems.forEach(item => {
      dispatch({ type: 'confirmExogenousItem', itemId: item.id });
    });
    dispatch({ type: 'completeStep', step: 'exogenous' });
    void navigate(assetsStep.path);
  };

  const handleSkip = () => {
    dispatch({ type: 'updateData', update: data => clearExogenous(data, report) });
    dispatch({ type: 'completeStep', step: 'exogenous' });
    void navigate(assetsStep.path);
  };

  const reviews = [...new Set(pendingItems.map(item => item.review).filter(review => review !== undefined))];

  return (
    <StepLayout aside={<DownloadHelpPanel />} className='gap-5 pt-9 pb-11'>
      <StepHeader
        title='Trae lo que la DIAN ya sabe de ti'
        description='Sube tu reporte de información exógena. Con él prellenamos ingresos, cuentas, deudas y retenciones; tú solo confirmas.'
      />

      <FileDropzone
        accept='.xlsx'
        maxSize={MAX_FILE_SIZE}
        hint={
          isReading
            ? 'Leyendo tu archivo…'
            : 'Excel (.xlsx), como lo descargas de la DIAN. Se lee en este navegador; no lo enviamos a ningún lado.'
        }
        onFileSelected={file => void handleFile(file)}
        error={error}
        selected={
          exogenous.fileName
            ? {
                name: exogenous.fileName,
                description: `Leído · ${String(countReportingEntities(report))} entidades reportaron ${String(visibleItems.length)} datos sobre ti`,
              }
            : undefined
        }
      />

      {exogenous.fileName && (
        <>
          <Text variant='title-m' as='h2'>
            Esto encontramos
          </Text>
          <YearMovementsSection />
          {GROUPS.map(group => {
            const items = groupItems(visibleItems.filter(item => group.kinds.includes(item.kind))).sort(
              (a, b) => group.kinds.indexOf(a.kind) - group.kinds.indexOf(b.kind),
            );
            if (items.length === 0) return null;
            return (
              <section key={group.title} className='flex flex-col gap-2'>
                <Text variant='caption' as='h3' className='text-fg-muted'>
                  {group.title}
                </Text>
                <ul className='flex flex-col rounded-lg border border-line bg-surface px-5'>
                  {items.map(item => (
                    <li
                      key={item.id}
                      className='flex items-center gap-3.5 border-b border-line py-2.5 last:border-b-0'
                    >
                      <Icon
                        icon={item.assetKind === 'vehicle' ? LuCar : ICONS[item.kind]}
                        size={20}
                        className='text-fg-secondary'
                      />
                      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                        <Text variant='body-m-strong'>{item.label}</Text>
                        <Text variant='note' className='text-fg-muted'>
                          {item.entity}
                        </Text>
                      </div>
                      {isConfirmed(item) ? (
                        <Chip variant='exogenous'>Listo</Chip>
                      ) : (
                        <Chip variant='review'>Confirma</Chip>
                      )}
                      <Text variant='figure-m' className='w-32.5 shrink-0 text-right'>
                        {formatCurrency(item.amount)}
                      </Text>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {reviews.map(review => (
            <Alert key={review} variant='info' title='Revisa este dato'>
              {REVIEW_TEXT[review]}
            </Alert>
          ))}
        </>
      )}

      <PreviousReturnCard />

      <VatQuestion />

      <div className='flex items-center gap-3'>
        <Button variant='ghost' onClick={() => void navigate(HOME_PATH)}>
          Atrás
        </Button>
        <div className='flex-1' />
        <Button variant='secondary' onClick={handleSkip}>
          Llenar sin exógena
        </Button>
        <Button icon={LuArrowRight} onClick={handleUseData} disabled={!exogenous.fileName}>
          Usar estos datos
        </Button>
      </div>
    </StepLayout>
  );
};

const downloadSteps = (year: number) => [
  'Entra al portal de la DIAN con tu usuario.',
  'Busca la consulta de información exógena.',
  `Elige el año gravable ${String(year)} y descarga el archivo.`,
];

const DownloadHelpPanel = () => {
  const { taxYear } = useTaxYear();
  return (
    <>
      <div className='flex items-center gap-2'>
        <Icon icon={LuCircleHelp} size={18} className='text-fg-action' />
        <Text variant='title-s' as='h2'>
          ¿Dónde la descargo?
        </Text>
      </div>
      <ol className='flex flex-col gap-3.5'>
        {downloadSteps(taxYear.year).map((step, index) => (
          <li key={step} className='flex items-start gap-3'>
            <Text
              as='span'
              variant='caption'
              className='flex size-6 shrink-0 items-center justify-center rounded-md bg-action-soft text-fg-action'
            >
              {index + 1}
            </Text>
            <Text variant='body-m' className='flex-1 text-fg-secondary'>
              {step}
            </Text>
          </li>
        ))}
      </ol>
      <NoteBox>
        La exógena es lo que otros reportaron sobre ti. Puede tener errores o vacíos; por eso nada se usa sin
        tu confirmación.
      </NoteBox>
    </>
  );
};
