import { useNavigate } from 'react-router';
import type { IconType } from 'react-icons';
import {
  LuArrowRight,
  LuBriefcase,
  LuCircleHelp,
  LuHouse,
  LuLandmark,
  LuReceipt,
  LuWallet,
} from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { FLOW_STEPS } from '@/app/flow';
import { applyExogenous, clearExogenous, countReportingEntities } from '@/domain/exogenous';
import { TAX_YEAR } from '@/domain/uvt';
import { sampleExogenous } from '@/mocks/sample-exogenous';
import { formatCurrency } from '@/shared/lib/format';
import { Alert, Button, Chip, FileDropzone, Icon, StepHeader, StepLayout, Text } from '@/shared/ui';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const HOUSING_ITEM_ID = 'housing-interest';

type FoundItem = {
  id: string;
  icon: IconType;
  label: string;
  entity: string;
  amount: number;
  needsConfirmation?: boolean;
};

const [, , incomeStep] = FLOW_STEPS;

/** Screen 03 · Importar exógena (Figma node 9:448). The upload is simulated with sample data. */
export const ExogenousPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDeclaration();
  const { data, exogenous } = state;
  const report = sampleExogenous;

  const bankAccounts = data.assets.filter(
    asset => asset.origin === 'exogenous' && asset.kind === 'bank-account',
  );
  const items: FoundItem[] = [
    {
      id: 'labor',
      icon: LuBriefcase,
      label: 'Pagos laborales',
      entity: report.withholdingAgent,
      amount: data.labor.salaries,
    },
    {
      id: 'withholdings',
      icon: LuBriefcase,
      label: 'Retención en la fuente',
      entity: report.withholdingAgent,
      amount: data.withholdings,
    },
    ...bankAccounts.map(account => ({
      id: account.id,
      icon: LuLandmark,
      label: `Saldo en cuentas al 31 de diciembre`,
      entity: account.detail,
      amount: account.amount,
    })),
    {
      id: HOUSING_ITEM_ID,
      icon: LuHouse,
      label: 'Intereses del crédito de vivienda',
      entity: report.housingInterest.entity,
      amount: data.deductions.housingInterestPaid,
      needsConfirmation: true,
    },
    {
      id: 'prepaid-health',
      icon: LuReceipt,
      label: 'Pagos de medicina prepagada',
      entity: report.prepaidHealth.entity,
      amount: data.deductions.prepaidHealthPaid,
    },
    {
      id: 'pension',
      icon: LuWallet,
      label: 'Aportes obligatorios a pensión',
      entity: report.pensionFund,
      amount: report.pensionContributions,
    },
  ];
  const isConfirmed = (item: FoundItem) =>
    !item.needsConfirmation || exogenous.confirmedItems.includes(item.id);
  const pendingItems = items.filter(item => !isConfirmed(item));

  const handleFile = (file: File) => {
    dispatch({ type: 'importExogenous', fileName: file.name });
    dispatch({ type: 'updateData', update: current => applyExogenous(current, report) });
  };

  const handleUseData = () => {
    pendingItems.forEach(item => {
      dispatch({ type: 'confirmExogenousItem', itemId: item.id });
    });
    dispatch({ type: 'completeStep', step: 'exogenous' });
    void navigate(incomeStep.path);
  };

  const handleSkip = () => {
    dispatch({ type: 'updateData', update: clearExogenous });
    dispatch({ type: 'completeStep', step: 'exogenous' });
    void navigate(incomeStep.path);
  };

  return (
    <StepLayout aside={<DownloadHelpPanel />} className='gap-5 pt-9 pb-11'>
      <StepHeader
        title='Trae lo que la DIAN ya sabe de ti'
        description='Sube tu reporte de información exógena. Con él prellenamos ingresos, cuentas, deudas y retenciones; tú solo confirmas.'
      />

      <FileDropzone
        accept='.xlsx,.xls,.pdf'
        maxSize={MAX_FILE_SIZE}
        hint='Excel (.xlsx) o PDF, como lo descargas de la DIAN.'
        onFileSelected={handleFile}
        selected={
          exogenous.fileName
            ? {
                name: exogenous.fileName,
                description: `Leído · ${countReportingEntities(report)} entidades reportaron ${items.length} datos sobre ti`,
              }
            : undefined
        }
      />

      {exogenous.fileName && (
        <>
          <Text variant='title-m' as='h2'>
            Esto encontramos
          </Text>
          <ul className='flex flex-col rounded-lg border border-line bg-surface px-5'>
            {items.map(item => (
              <li
                key={item.id}
                className='flex items-center gap-3.5 border-b border-line py-2.5 last:border-b-0'
              >
                <Icon icon={item.icon} size={20} className='text-fg-secondary' />
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
          {pendingItems.some(item => item.id === HOUSING_ITEM_ID) && (
            <Alert variant='info' title='Confirma los intereses de vivienda'>
              {report.housingInterest.entity} reportó {formatCurrency(data.deductions.housingInterestPaid)}.
              Compáralo con tu certificado antes de usarlo como deducción.
            </Alert>
          )}
        </>
      )}

      <div className='flex items-center gap-3'>
        <Button variant='ghost' onClick={() => void navigate(FLOW_STEPS[0].path)}>
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

const DOWNLOAD_STEPS = [
  'Entra al portal de la DIAN con tu usuario.',
  'Busca la consulta de información exógena.',
  `Elige el año gravable ${TAX_YEAR} y descarga el archivo.`,
];

const DownloadHelpPanel = () => (
  <>
    <div className='flex items-center gap-2'>
      <Icon icon={LuCircleHelp} size={18} className='text-fg-action' />
      <Text variant='title-s' as='h2'>
        ¿Dónde la descargo?
      </Text>
    </div>
    <ol className='flex flex-col gap-3.5'>
      {DOWNLOAD_STEPS.map((step, index) => (
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
    <div className='flex flex-col gap-1 rounded-md bg-subtle p-4'>
      <Text variant='caption' className='text-fg-secondary'>
        Bueno saber
      </Text>
      <Text variant='body-m' className='text-fg-secondary'>
        La exógena es lo que otros reportaron sobre ti. Puede tener errores o vacíos; por eso nada se usa sin
        tu confirmación.
      </Text>
    </div>
  </>
);
