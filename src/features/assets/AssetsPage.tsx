import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { IconType } from 'react-icons';
import { LuArrowRight, LuCar, LuChartLine, LuHouse, LuLandmark, LuPackage, LuWallet } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { getStep } from '@/app/flow';
import type { AssetKind, ValueOrigin } from '@/domain/declaration';
import { EstimatePanel } from '@/features/estimate/EstimatePanel';
import { formatCurrency } from '@/shared/lib/format';
import { useIsCompact } from '@/shared/lib/use-compact';
import {
  Alert,
  Button,
  CalcRow,
  Chip,
  Icon,
  NoteBox,
  StepHeader,
  StepLayout,
  Text,
  StepActions,
  RowContent,
} from '@/shared/ui';

import { HoldingDrawer } from './HoldingDrawer';
import type { HoldingDraft } from './HoldingDrawer';

const exogenousStep = getStep('exogenous');
const incomeStep = getStep('income');

const KIND_ICONS: Record<AssetKind, IconType> = {
  'real-estate': LuHouse,
  'bank-account': LuLandmark,
  vehicle: LuCar,
  investment: LuChartLine,
  other: LuPackage,
};

type Editing = { type: 'asset' | 'debt'; draft: HoldingDraft; isNew: boolean } | null;

const newDraft = (): HoldingDraft => ({
  id: crypto.randomUUID(),
  kind: 'real-estate',
  label: '',
  detail: '',
  amount: 0,
});

/** Screen 05 · Patrimonio (Figma node 14:1386). */
export const AssetsPage = () => {
  const isCompact = useIsCompact();
  const { taxYear } = useTaxYear();
  const navigate = useNavigate();
  const { state, dispatch, result } = useDeclaration();
  const { assets, debts } = state.data;
  const [editing, setEditing] = useState<Editing>(null);
  const firstRealEstate = assets.find(asset => asset.kind === 'real-estate');

  const closeDrawer = () => {
    setEditing(null);
  };

  const saveHolding = (draft: HoldingDraft) => {
    if (!editing) return;
    // Saving confirms the value: it is the user's from now on and no longer needs review.
    // Saving confirms the value: it is the user's from now on and no longer needs review.
    const item = { ...draft, origin: 'user' as const, needsReview: false };
    dispatch({
      type: 'updateData',
      update: data =>
        editing.type === 'asset'
          ? {
              ...data,
              assets: editing.isNew
                ? [...data.assets, item]
                : data.assets.map(asset => (asset.id === item.id ? item : asset)),
            }
          : {
              ...data,
              debts: editing.isNew
                ? [
                    ...data.debts,
                    {
                      id: item.id,
                      label: item.label,
                      detail: item.detail,
                      amount: item.amount,
                      origin: item.origin,
                    },
                  ]
                : data.debts.map(debt => (debt.id === item.id ? { ...debt, ...item } : debt)),
            },
    });
    closeDrawer();
  };

  const deleteHolding = (id: string) => {
    dispatch({
      type: 'updateData',
      update: data => ({
        ...data,
        assets: data.assets.filter(asset => asset.id !== id),
        debts: data.debts.filter(debt => debt.id !== id),
      }),
    });
    closeDrawer();
  };

  const handleContinue = () => {
    dispatch({ type: 'completeStep', step: 'assets' });
    void navigate(incomeStep.path);
  };

  return (
    <StepLayout aside={<AssetsEstimate />} className='gap-5.5 py-10'>
      <StepHeader
        title={`¿Qué tenías al 31 de diciembre de ${taxYear.year}?`}
        description='Tu patrimonio no paga impuesto de renta, pero la DIAN lo usa para revisar que tus ingresos cuadren con lo que tienes.'
      />

      {assets.some(asset => asset.needsReview) && (
        <Alert variant='warning' title='Revisa el valor de tu vehículo'>
          La DIAN reporta su avalúo, pero en la declaración va el costo fiscal: lo que pagaste por él. Tócalo
          en la lista para corregirlo.
        </Alert>
      )}

      <HoldingSection
        title='Bienes y derechos'
        addLabel='Agregar un bien'
        emptyText='Aún no has agregado bienes.'
        onAdd={() => {
          setEditing({ type: 'asset', draft: newDraft(), isNew: true });
        }}
        items={assets.map(asset => ({
          id: asset.id,
          icon: KIND_ICONS[asset.kind],
          label: asset.label,
          detail: asset.detail,
          amount: asset.amount,
          origin: asset.origin,
          needsReview: asset.needsReview === true,
          onEdit: () => {
            setEditing({ type: 'asset', draft: { ...asset }, isNew: false });
          },
        }))}
      />

      <HoldingSection
        title='Deudas'
        addLabel='Agregar una deuda'
        emptyText='No tienes deudas registradas.'
        onAdd={() => {
          setEditing({ type: 'debt', draft: { ...newDraft(), kind: 'other' }, isNew: true });
        }}
        items={debts.map(debt => ({
          id: debt.id,
          icon: LuWallet,
          label: debt.label,
          detail: debt.detail,
          amount: debt.amount,
          origin: debt.origin,
          onEdit: () => {
            setEditing({ type: 'debt', draft: { ...debt, kind: 'other' }, isNew: false });
          },
        }))}
      />

      {isCompact ? (
        // Figma M05: one line per figure, with the operator in the name.
        <div className='flex flex-col gap-2.5 rounded-lg bg-rail px-5 py-4'>
          <SummaryLine label='Patrimonio bruto' value={result.grossAssets} />
          <SummaryLine label='− Deudas' value={result.totalDebts} />
          <SummaryLine label='= Patrimonio líquido' value={result.netAssets} highlight />
        </div>
      ) : (
        <div className='flex items-center gap-5 rounded-lg bg-rail px-6 py-4.5'>
          <Summary label='Patrimonio bruto' value={result.grossAssets} />
          <Operator symbol='−' />
          <Summary label='Deudas' value={result.totalDebts} />
          <Operator symbol='=' />
          <Summary label='Patrimonio líquido' value={result.netAssets} highlight />
        </div>
      )}

      {firstRealEstate && (
        <Alert
          variant='info'
          title={
            firstRealEstate.label.toLowerCase().startsWith('apartamento')
              ? '¿Qué valor pongo al apartamento?'
              : '¿Qué valor pongo a mi inmueble?'
          }
        >
          Usa el mayor entre el avalúo catastral de {taxYear.year} y su costo fiscal (lo que pagaste más
          mejoras y reajustes).
        </Alert>
      )}

      <StepActions>
        <Button variant='ghost' onClick={() => void navigate(exogenousStep.path)}>
          Atrás
        </Button>
        <Button icon={LuArrowRight} onClick={handleContinue}>
          Guardar y seguir
        </Button>
      </StepActions>

      <HoldingDrawer
        type={editing?.type ?? 'asset'}
        draft={editing?.draft ?? null}
        isNew={editing?.isNew ?? true}
        onClose={closeDrawer}
        onSave={saveHolding}
        onDelete={deleteHolding}
      />
    </StepLayout>
  );
};

type HoldingRow = {
  id: string;
  icon: IconType;
  label: string;
  detail: string;
  amount: number;
  origin: ValueOrigin;
  needsReview?: boolean;
  onEdit: () => void;
};

const HoldingSection = ({
  title,
  addLabel,
  emptyText,
  onAdd,
  items,
}: {
  title: string;
  addLabel: string;
  emptyText: string;
  onAdd: () => void;
  items: HoldingRow[];
}) => (
  <section className='flex flex-col gap-2.5'>
    <div className='flex items-center gap-2'>
      <Text variant='title-s' as='h2' className='flex-1'>
        {title}
      </Text>
      <Button variant='ghost' onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
    <ul className='flex flex-col rounded-lg border border-line bg-surface px-5'>
      {items.length === 0 && (
        <li className='py-4'>
          <Text variant='body-m' className='text-fg-muted'>
            {emptyText}
          </Text>
        </li>
      )}
      {items.map(item => (
        <li key={item.id} className='border-b border-line last:border-b-0'>
          <button
            type='button'
            onClick={item.onEdit}
            aria-label={`Editar ${item.label}`}
            className='-mx-5 flex w-[calc(100%+2.5rem)] cursor-pointer items-center gap-3.5 px-5 py-3.25 text-left transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none max-xl:py-3.5'
          >
            <RowContent
              icon={<Icon icon={item.icon} size={20} className='shrink-0 text-fg-secondary' />}
              title={item.label}
              detail={item.detail}
              badge={
                item.needsReview ? (
                  <Chip variant='review'>Revisar</Chip>
                ) : item.origin === 'exogenous' ? (
                  <Chip variant='exogenous'>Desde exógena</Chip>
                ) : (
                  <Chip variant='box'>Lo ingresaste tú</Chip>
                )
              }
              value={
                <Text as='span' variant='figure-m' className='w-32.5 shrink-0 text-right max-xl:w-auto'>
                  {formatCurrency(item.amount)}
                </Text>
              }
            />
          </button>
        </li>
      ))}
    </ul>
  </section>
);

const Summary = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <div className='flex flex-col gap-0.5'>
    <Text variant='note' className={highlight ? 'text-fg-action' : 'text-fg-muted'}>
      {label}
    </Text>
    <Text variant={highlight ? 'figure-l' : 'figure-m'}>{formatCurrency(value)}</Text>
  </div>
);

const SummaryLine = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <div className='flex items-center justify-between gap-3'>
    <Text variant='note' className={highlight ? 'text-fg-action' : 'text-fg-muted'}>
      {label}
    </Text>
    <Text variant={highlight ? 'figure-l' : 'figure-m'}>{formatCurrency(value)}</Text>
  </div>
);

const Operator = ({ symbol }: { symbol: string }) => (
  <Text as='span' variant='figure-l' aria-hidden className='text-fg-muted'>
    {symbol}
  </Text>
);

const AssetsEstimate = () => {
  const { result, estimateIncludesDeductions } = useDeclaration();

  return (
    <EstimatePanel
      note={
        estimateIncludesDeductions
          ? 'Tu patrimonio no cambia este valor.'
          : 'Tu patrimonio no cambia este valor. Lo que viene, tus ingresos y tus deducciones, sí.'
      }
      footer={
        <NoteBox withIcon>
          Si tu patrimonio creció más de lo que explican tus ingresos, la DIAN puede pedirte justificarlo. Por
          eso conviene declararlo completo.
        </NoteBox>
      }
    >
      <CalcRow label='Patrimonio bruto' value={result.grossAssets} />
      <CalcRow variant='subtract' label='Deudas' value={result.totalDebts} />
      <CalcRow variant='total' label='Patrimonio líquido' value={result.netAssets} />
    </EstimatePanel>
  );
};
