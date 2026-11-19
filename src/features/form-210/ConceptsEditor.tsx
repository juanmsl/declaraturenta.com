import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';

import type { BoxConcept } from '@/domain/box-concepts';
import { editConcept } from '@/domain/box-concepts';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Button, Chip, Icon, MoneyField, Text, TextField } from '@/shared/ui';

type ConceptsEditorProps = {
  boxNumber: number;
  concepts: BoxConcept[];
  onChange: (concepts: BoxConcept[]) => void;
  isCount: boolean;
};

const plural = (count: number) => `${String(count)} ${count === 1 ? 'concepto sumado' : 'conceptos sumados'}`;

/** Editable list of the concepts that add up to a box (Figma screen 09b). */
export const ConceptsEditor = ({ boxNumber, concepts, onChange, isCount }: ConceptsEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const format = (value: number) => (isCount ? formatNumber(value) : formatCurrency(value));
  const total = concepts.reduce((sum, concept) => sum + concept.amount, 0);

  const update = (id: string, patch: Partial<Pick<BoxConcept, 'label' | 'detail' | 'amount'>>) => {
    onChange(concepts.map(concept => (concept.id === id ? editConcept(concept, patch) : concept)));
  };

  const add = () => {
    const id = crypto.randomUUID();
    onChange([...concepts, { id, label: '', detail: '', amount: 0, origin: 'user' }]);
    setEditingId(id);
  };

  const remove = (id: string) => {
    onChange(concepts.filter(concept => concept.id !== id));
    setEditingId(null);
  };

  return (
    <section className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <Text variant='title-s' as='h3' className='flex-1'>
          {plural(concepts.length)}
        </Text>
        <button
          type='button'
          onClick={add}
          className='flex cursor-pointer items-center gap-1.5 rounded-sm text-fg-action hover:underline focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
        >
          <Icon icon={LuPlus} size={16} />
          <Text as='span' variant='caption' className='text-current'>
            Agregar concepto
          </Text>
        </button>
      </div>

      {concepts.length > 0 && (
        <ul className='flex flex-col rounded-lg border border-line bg-surface px-4'>
          {concepts.map(concept => (
            <li key={concept.id} className='border-b border-line last:border-b-0'>
              {editingId === concept.id ? (
                <div className='flex flex-col gap-3 py-3'>
                  <TextField
                    name={`label-${concept.id}`}
                    label='Concepto'
                    value={concept.label}
                    placeholder='Ej.: Bonificación'
                    onChange={label => {
                      update(concept.id, { label });
                    }}
                  />
                  <TextField
                    name={`detail-${concept.id}`}
                    label='Entidad o descripción'
                    value={concept.detail}
                    onChange={detail => {
                      update(concept.id, { detail });
                    }}
                  />
                  <MoneyField
                    name={`amount-${concept.id}`}
                    label={isCount ? 'Cantidad' : 'Valor'}
                    currency={!isCount}
                    value={concept.amount}
                    onChange={amount => {
                      update(concept.id, { amount });
                    }}
                  />
                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      className='text-fg-error hover:bg-coral-soft'
                      onClick={() => {
                        remove(concept.id);
                      }}
                    >
                      Quitar
                    </Button>
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => {
                        setEditingId(null);
                      }}
                    >
                      Listo
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => {
                    setEditingId(concept.id);
                  }}
                  aria-label={`Editar ${concept.label || 'concepto'}`}
                  className='-mx-4 flex w-[calc(100%+2rem)] cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none'
                >
                  <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <Text as='span' variant='body-m-strong'>
                      {concept.label || 'Concepto sin nombre'}
                    </Text>
                    <Text as='span' variant='note' className='text-fg-muted'>
                      {concept.exogenousAmount !== undefined && concept.exogenousAmount !== concept.amount
                        ? `La exógena decía ${format(concept.exogenousAmount)}`
                        : concept.detail}
                    </Text>
                  </span>
                  {concept.origin === 'exogenous' ? (
                    <Chip variant='exogenous'>Exógena</Chip>
                  ) : (
                    <Chip variant='box'>Por ti</Chip>
                  )}
                  <Text as='span' variant='figure-m' className='w-30 shrink-0 text-right'>
                    {format(concept.amount)}
                  </Text>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className='flex items-center gap-4 border-t border-line pt-4'>
        <Text variant='body-m-strong' className='flex-1'>
          Total casilla {boxNumber}
        </Text>
        <Text variant='figure-l'>{format(total)}</Text>
      </div>
    </section>
  );
};
