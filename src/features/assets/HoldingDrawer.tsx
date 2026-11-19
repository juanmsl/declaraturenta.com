import { useState } from 'react';

import type { AssetKind } from '@/domain/declaration';
import { TAX_YEAR } from '@/domain/uvt';
import { Button, Drawer, MoneyField, SelectField, TextField } from '@/shared/ui';

export type HoldingDraft = {
  id: string;
  kind: AssetKind;
  label: string;
  detail: string;
  amount: number;
};

const ASSET_KIND_OPTIONS: readonly { value: AssetKind; label: string }[] = [
  { value: 'real-estate', label: 'Inmueble (casa, apartamento, lote)' },
  { value: 'bank-account', label: 'Cuenta bancaria o de ahorro' },
  { value: 'vehicle', label: 'Vehículo' },
  { value: 'investment', label: 'Inversión (CDT, acciones, fondos)' },
  { value: 'other', label: 'Otro bien o derecho' },
];

const AMOUNT_HINTS: Record<AssetKind, string> = {
  'real-estate': 'Usa el mayor entre el avalúo catastral y el costo fiscal.',
  'bank-account': 'Saldo al 31 de diciembre según tu certificado bancario.',
  vehicle: 'Usa el valor del avalúo comercial o lo que pagaste, el que sea mayor.',
  investment: 'Valor al 31 de diciembre según el certificado de la entidad.',
  other: 'Valor al 31 de diciembre.',
};

type HoldingDrawerProps = {
  /** `asset` shows the asset type selector. */
  type: 'asset' | 'debt';
  /** Item to edit, or a new empty draft. */
  draft: HoldingDraft | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (draft: HoldingDraft) => void;
  onDelete: (id: string) => void;
};

/** Side panel to add, edit or delete an asset or a debt (not designed in Figma; see ADR 0017). */
export const HoldingDrawer = ({ type, draft, isNew, onClose, onSave, onDelete }: HoldingDrawerProps) => (
  <Drawer
    isOpen={draft !== null}
    onClose={onClose}
    title={
      type === 'asset'
        ? isNew
          ? 'Agregar un bien'
          : 'Editar bien'
        : isNew
          ? 'Agregar una deuda'
          : 'Editar deuda'
    }
    subtitle={`Valores al 31 de diciembre de ${TAX_YEAR}`}
  >
    {draft && (
      <HoldingForm
        key={draft.id}
        type={type}
        draft={draft}
        isNew={isNew}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    )}
  </Drawer>
);

const HoldingForm = ({
  type,
  draft,
  isNew,
  onClose,
  onSave,
  onDelete,
}: Omit<HoldingDrawerProps, 'draft'> & { draft: HoldingDraft }) => {
  const [values, setValues] = useState(draft);
  const [submitted, setSubmitted] = useState(false);
  const labelError = submitted && !values.label.trim() ? 'Escribe un nombre para identificarlo.' : undefined;
  const amountError = submitted && values.amount <= 0 ? 'Escribe el valor en pesos.' : undefined;

  const handleSave = () => {
    setSubmitted(true);
    if (!values.label.trim() || values.amount <= 0) return;
    onSave({ ...values, label: values.label.trim(), detail: values.detail.trim() });
  };

  return (
    <form
      className='flex flex-1 flex-col gap-5'
      onSubmit={event => {
        event.preventDefault();
        handleSave();
      }}
      noValidate
    >
      {type === 'asset' && (
        <SelectField
          name='kind'
          label='Tipo de bien'
          value={values.kind}
          options={ASSET_KIND_OPTIONS}
          onChange={kind => {
            setValues(current => ({ ...current, kind }));
          }}
        />
      )}
      <TextField
        name='label'
        label='Nombre'
        value={values.label}
        placeholder={type === 'asset' ? 'Ej.: Apartamento en Bogotá' : 'Ej.: Crédito hipotecario'}
        onChange={label => {
          setValues(current => ({ ...current, label }));
        }}
        error={labelError}
      />
      <TextField
        name='detail'
        label='Entidad o descripción'
        value={values.detail}
        placeholder='Ej.: Banco Cordillera'
        onChange={detail => {
          setValues(current => ({ ...current, detail }));
        }}
      />
      <MoneyField
        name='amount'
        label={type === 'asset' ? 'Valor' : 'Saldo de la deuda'}
        value={values.amount}
        onChange={amount => {
          setValues(current => ({ ...current, amount }));
        }}
        hint={
          type === 'asset'
            ? AMOUNT_HINTS[values.kind]
            : 'Lo que debías al 31 de diciembre, según el certificado.'
        }
        error={amountError}
      />
      <div className='mt-auto flex items-center gap-3 border-t border-line pt-5'>
        {!isNew && (
          <Button
            type='button'
            variant='ghost'
            className='text-fg-error hover:bg-coral-soft'
            onClick={() => {
              onDelete(values.id);
            }}
          >
            Eliminar
          </Button>
        )}
        <div className='flex-1' />
        <Button type='button' variant='ghost' onClick={onClose}>
          Cancelar
        </Button>
        <Button type='submit'>Guardar</Button>
      </div>
    </form>
  );
};
