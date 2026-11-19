import { useState } from 'react';

import { useDeclaration } from '@/app/declaration/declaration-context';
import {
  applyBoxConcepts,
  BOX_DESCRIPTIONS,
  getBoxConcepts,
  isCountBox,
  isEditableBox,
} from '@/domain/box-concepts';
import type { BoxConcept, EditableBox } from '@/domain/box-concepts';
import type { Form210, Form210Box } from '@/domain/form-210';
import { findDependentBoxes, scheduleColumnOf } from '@/domain/form-210';
import { LABOR_LIMITS_UVT } from '@/domain/labor-income';
import { uvtToPesos } from '@/domain/uvt';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Alert, Button, CalcRow, Chip, Drawer, MoneyField, Text, ToggleField } from '@/shared/ui';

import { ConceptsEditor } from './ConceptsEditor';
import { sectionOf } from './sections';

type BoxDetailDrawerProps = {
  form: Form210;
  boxNumber: number | null;
  onClose: () => void;
};

/** Detail of a box: what adds up to it and where it goes (Figma screen 09b; ADR 0020). */
export const BoxDetailDrawer = ({ form, boxNumber, onClose }: BoxDetailDrawerProps) => {
  const box = boxNumber === null ? undefined : form.get(boxNumber);

  return (
    <Drawer
      isOpen={box !== undefined}
      onClose={onClose}
      eyebrow={box && <Chip variant='box'>Casilla {box.number}</Chip>}
      title={box?.label ?? ''}
      subtitle={
        box ? [sectionOf(box.number), scheduleColumnOf(box.number)].filter(Boolean).join(' · ') : undefined
      }
    >
      {box && <BoxDetail key={box.number} form={form} box={box} onClose={onClose} />}
    </Drawer>
  );
};

const FeedsNote = ({ form, box }: { form: Form210; box: Form210Box }) => {
  const direct = findDependentBoxes(form, box.number);
  const [first] = direct;
  if (!first) return null;
  // With a single direct dependent, also name the furthest box it feeds (Figma 09b: "… 34 (= 32 − 33) y la 91").
  const rest = direct.length === 1 ? findDependentBoxes(form, first.number).slice(-1) : direct.slice(1);
  return (
    <Text variant='note' className='text-fg-secondary'>
      Alimenta la casilla {first.number}
      {first.formula?.startsWith('=') ? ` (${first.formula})` : ''}
      {rest.length > 0 ? ` y ${rest.map(item => `la ${String(item.number)}`).join(', ')}` : ''}.
    </Text>
  );
};

const TotalCard = ({ form, box, total }: { form: Form210; box: Form210Box; total: number }) => (
  <section className='flex flex-col gap-1 rounded-lg bg-rail p-5'>
    <Text variant='caption' className='text-fg-action'>
      Total de la casilla
    </Text>
    <Text variant='figure-xl'>{isCountBox(box.number) ? formatNumber(total) : formatCurrency(total)}</Text>
    <FeedsNote form={form} box={box} />
  </section>
);

const Footer = ({
  onClose,
  onSave,
  canSave,
}: {
  onClose: () => void;
  onSave?: () => void;
  canSave?: boolean;
}) => (
  <div className='mt-auto flex items-center justify-between border-t border-line pt-5'>
    <Button type='button' variant='ghost' onClick={onClose}>
      Cerrar
    </Button>
    {onSave && (
      <Button type='button' onClick={onSave} disabled={!canSave}>
        Guardar cambios
      </Button>
    )}
  </div>
);

const BoxDetail = ({ form, box, onClose }: { form: Form210; box: Form210Box; onClose: () => void }) => {
  const description = BOX_DESCRIPTIONS[box.number];

  if (isEditableBox(box.number)) {
    return (
      <EditableDetail
        form={form}
        box={box}
        boxNumber={box.number}
        description={description}
        onClose={onClose}
      />
    );
  }
  if (box.number === 39) return <OtherDeductionsDetail form={form} box={box} onClose={onClose} />;
  if (box.number === 36) return <ExemptDetail form={form} box={box} onClose={onClose} />;

  return (
    <>
      <TotalCard form={form} box={box} total={box.value} />
      <Alert variant='info' title='Por ahora no calculamos esta casilla'>
        Queda en $ 0. Si tuviste este tipo de ingresos o valores, pronto podrás registrarlos aquí.
      </Alert>
      <Footer onClose={onClose} />
    </>
  );
};

const EditableDetail = ({
  form,
  box,
  boxNumber,
  description,
  onClose,
}: {
  form: Form210;
  box: Form210Box;
  boxNumber: EditableBox;
  description: string | undefined;
  onClose: () => void;
}) => {
  const { state, dispatch } = useDeclaration();
  const [initial] = useState(() => getBoxConcepts(boxNumber, state.data));
  const [concepts, setConcepts] = useState<BoxConcept[]>(initial);
  const isDirty = JSON.stringify(concepts) !== JSON.stringify(initial);
  const total = concepts.reduce((sum, concept) => sum + concept.amount, 0);

  const save = () => {
    const valid = concepts.filter(concept => concept.amount !== 0 || concept.label.trim() !== '');
    dispatch({ type: 'updateData', update: data => applyBoxConcepts(boxNumber, data, valid) });
    onClose();
  };

  return (
    <>
      <TotalCard form={form} box={box} total={total} />
      {description && (
        <Text variant='body-m' className='text-fg-secondary'>
          {description}
        </Text>
      )}
      {boxNumber === 38 && total > uvtToPesos(LABOR_LIMITS_UVT.housingInterest) && (
        <Alert variant='warning' title='Pasas el tope de 1.200 UVT'>
          La casilla toma {formatCurrency(uvtToPesos(LABOR_LIMITS_UVT.housingInterest))}.
        </Alert>
      )}
      <ConceptsEditor
        boxNumber={box.number}
        concepts={concepts}
        onChange={setConcepts}
        isCount={isCountBox(box.number)}
      />
      <Footer onClose={onClose} onSave={save} canSave={isDirty} />
    </>
  );
};

const OtherDeductionsDetail = ({
  form,
  box,
  onClose,
}: {
  form: Form210;
  box: Form210Box;
  onClose: () => void;
}) => {
  const { state, dispatch, result } = useDeclaration();
  const [values, setValues] = useState(state.data.deductions);
  const isDirty = JSON.stringify(values) !== JSON.stringify(state.data.deductions);

  const save = () => {
    dispatch({ type: 'updateData', update: data => ({ ...data, deductions: values }) });
    onClose();
  };

  return (
    <>
      <TotalCard form={form} box={box} total={box.value} />
      <Text variant='body-m' className='text-fg-secondary'>
        {BOX_DESCRIPTIONS[39]}
      </Text>
      <ToggleField
        name='hasDependent'
        label='Tengo un dependiente económico'
        description={`10 % de tus ingresos brutos laborales, hasta ${formatNumber(LABOR_LIMITS_UVT.dependent)} UVT. Hoy suma ${formatCurrency(result.labor.dependent)}.`}
        checked={values.hasDependent}
        onChange={hasDependent => {
          setValues(current => ({ ...current, hasDependent }));
        }}
      />
      <MoneyField
        name='prepaidHealthPaid'
        label='Medicina prepagada'
        value={values.prepaidHealthPaid}
        onChange={prepaidHealthPaid => {
          setValues(current => ({ ...current, prepaidHealthPaid }));
        }}
        hint={`Hasta 16 UVT al mes, ${formatCurrency(uvtToPesos(LABOR_LIMITS_UVT.prepaidHealth))} al año.`}
      />
      <Footer onClose={onClose} onSave={save} canSave={isDirty} />
    </>
  );
};

const ExemptDetail = ({ form, box, onClose }: { form: Form210; box: Form210Box; onClose: () => void }) => {
  const { result } = useDeclaration();
  const { labor } = result;

  return (
    <>
      <TotalCard form={form} box={box} total={box.value} />
      <Text variant='body-m' className='text-fg-secondary'>
        {BOX_DESCRIPTIONS[36]}
      </Text>
      <div className='flex flex-col'>
        <CalcRow label='Renta líquida' value={labor.netIncome} />
        <CalcRow variant='subtract' label='Deducciones' value={labor.totalDeductions} />
        <CalcRow variant='subtract' label='Aportes voluntarios' value={labor.voluntaryContributions} />
        <CalcRow
          variant='subtotal'
          label='Base'
          value={Math.max(0, labor.netIncome - labor.totalDeductions - labor.voluntaryContributions)}
        />
        <CalcRow
          label={`25 %, hasta ${formatNumber(LABOR_LIMITS_UVT.exempt25)} UVT`}
          value={labor.exempt25}
        />
      </div>
      <Text variant='note' className='text-fg-muted'>
        Se calcula sola. Cambia si corriges tus ingresos o deducciones.
      </Text>
      <Footer onClose={onClose} />
    </>
  );
};
