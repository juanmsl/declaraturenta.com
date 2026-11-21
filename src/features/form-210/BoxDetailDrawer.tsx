import { useState } from 'react';

import { buildContextValue } from '@/app/declaration/context-value';
import { useDeclaration } from '@/app/declaration/declaration-context';
import { DraftDeclaration } from '@/app/declaration/DraftDeclaration';
import { AdjustmentsSections } from '@/features/adjustments/AdjustmentsSections';
import { CapitalNonLaborExtras } from '@/features/income/CapitalNonLaborExtras';
import { FeesSection } from '@/features/income/FeesSection';
import { IndependentIncomeQuestion } from '@/features/income/IndependentIncomeQuestion';
import { ScheduleSection } from '@/features/income/OtherSchedulesSection';
import { VoluntaryContributionField } from '@/features/result/FilingSection';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import {
  applyBoxConcepts,
  boxDescription,
  getBoxConcepts,
  isCountBox,
  isEditableBox,
} from '@/domain/box-concepts';
import type { BoxConcept, EditableBox } from '@/domain/box-concepts';
import type { Form210, Form210Box } from '@/domain/form-210';
import { buildForm210, findDependentBoxes, scheduleColumnOf } from '@/domain/form-210';
import type { AdjustmentId } from '@/domain/declaration';
import { uvtToPesos } from '@/domain/uvt';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Alert, Button, CalcRow, Chip, Drawer, MoneyField, Text } from '@/shared/ui';

import { ConceptsEditor } from './ConceptsEditor';
import { sectionOf } from './sections';

type SectionKey =
  'fees' | 'capital-non-labor' | 'pensions' | 'dividends' | 'occasional-gains' | 'voluntary' | AdjustmentId;

/** Boxes edited with a section of a step, shown whole in the panel (ADRs 0031, 0032, 0038, 0047). */
const SECTION_BOXES: Partial<Record<number, { key: SectionKey; screen: string }>> = {
  43: { key: 'fees', screen: 'Ingresos' },
  44: { key: 'fees', screen: 'Ingresos' },
  45: { key: 'fees', screen: 'Ingresos' },
  60: { key: 'capital-non-labor', screen: 'Ingresos' },
  75: { key: 'capital-non-labor', screen: 'Ingresos' },
  76: { key: 'capital-non-labor', screen: 'Ingresos' },
  77: { key: 'capital-non-labor', screen: 'Ingresos' },
  99: { key: 'pensions', screen: 'Ingresos' },
  100: { key: 'pensions', screen: 'Ingresos' },
  104: { key: 'dividends', screen: 'Ingresos' },
  105: { key: 'dividends', screen: 'Ingresos' },
  107: { key: 'dividends', screen: 'Ingresos' },
  108: { key: 'dividends', screen: 'Ingresos' },
  109: { key: 'dividends', screen: 'Ingresos' },
  112: { key: 'occasional-gains', screen: 'Ingresos' },
  113: { key: 'occasional-gains', screen: 'Ingresos' },
  114: { key: 'occasional-gains', screen: 'Ingresos' },
  56: { key: 'losses', screen: 'Otros ajustes' },
  72: { key: 'losses', screen: 'Otros ajustes' },
  89: { key: 'losses', screen: 'Otros ajustes' },
  94: { key: 'losses', screen: 'Otros ajustes' },
  95: { key: 'presumptive-excess', screen: 'Otros ajustes' },
  96: { key: 'taxable-additions', screen: 'Otros ajustes' },
  62: { key: 'ece', screen: 'Otros ajustes' },
  79: { key: 'ece', screen: 'Otros ajustes' },
  110: { key: 'can-dividends', screen: 'Otros ajustes' },
  141: { key: 'voluntary', screen: 'Resultado' },
};

const SectionFields = ({ sectionKey }: { sectionKey: SectionKey }) => {
  const { state } = useDeclaration();
  switch (sectionKey) {
    case 'fees':
      return (
        <>
          <IndependentIncomeQuestion />
          {state.data.labor.hasIndependentIncome && <FeesSection />}
        </>
      );
    case 'capital-non-labor':
      return <CapitalNonLaborExtras alwaysOpen />;
    case 'pensions':
      return <ScheduleSection schedule='pensions' />;
    case 'dividends':
      return <ScheduleSection schedule='dividends' />;
    case 'occasional-gains':
      return <ScheduleSection schedule='occasionalGains' />;
    case 'voluntary':
      return <VoluntaryContributionField />;
    default:
      return <AdjustmentsSections only={[sectionKey]} />;
  }
};

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
  const { taxYear } = useTaxYear();
  const description = boxDescription(box.number, taxYear);

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
  const section = SECTION_BOXES[box.number];
  if (section) return <SectionDetail box={box} section={section} onClose={onClose} />;

  return (
    <>
      <TotalCard form={form} box={box} total={box.value} />
      {description && (
        <Text variant='body-m' className='text-fg-secondary'>
          {description}
        </Text>
      )}
      <Footer onClose={onClose} />
    </>
  );
};

/**
 * The whole section of the step that fills the box, on a copy of the return: the total updates as
 * you type, «Guardar cambios» applies it and «Cerrar» discards it (ADR 0047).
 */
const SectionDetail = ({
  box,
  section,
  onClose,
}: {
  box: Form210Box;
  section: { key: SectionKey; screen: string };
  onClose: () => void;
}) => {
  const { taxYear } = useTaxYear();
  const { state, dispatch } = useDeclaration();
  const [initial] = useState(state);
  const [draft, setDraft] = useState(state);
  const isDirty =
    JSON.stringify([draft.data, draft.activeSchedules]) !==
    JSON.stringify([initial.data, initial.activeSchedules]);
  const draftValue = buildContextValue(draft, () => undefined);
  const draftForm = buildForm210(draft.data, draftValue.result, taxYear);
  const draftBox = draftForm.get(box.number) ?? box;

  const save = () => {
    dispatch({
      type: 'updateData',
      update: () => draft.data,
    });
    for (const id of new Set([...initial.activeSchedules, ...draft.activeSchedules])) {
      if (initial.activeSchedules.includes(id) !== draft.activeSchedules.includes(id)) {
        dispatch({ type: 'toggleSchedule', scheduleId: id });
      }
    }
    onClose();
  };

  return (
    <>
      <TotalCard form={draftForm} box={draftBox} total={draftBox.value} />
      <Text variant='note' className='text-fg-muted'>
        Es la misma sección de {section.screen}: lo que guardes aquí también se ve allá.
      </Text>
      <DraftDeclaration draft={draft} setDraft={setDraft}>
        <div className='flex flex-col gap-5'>
          <SectionFields sectionKey={section.key} />
        </div>
      </DraftDeclaration>
      <Footer onClose={onClose} onSave={save} canSave={isDirty} />
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
  const { taxYear } = useTaxYear();
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
      {boxNumber === 38 && total > uvtToPesos(taxYear.labor.housingInterestUvt, taxYear) && (
        <Alert variant='warning' title='Pasas el tope de 1.200 UVT'>
          La casilla toma {formatCurrency(uvtToPesos(taxYear.labor.housingInterestUvt, taxYear))}.
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
  const { taxYear } = useTaxYear();
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
        {boxDescription(39, taxYear)}
      </Text>
      <MoneyField
        name='dependents'
        label='Dependientes económicos'
        currency={false}
        value={values.dependents}
        onChange={dependents => {
          setValues(current => ({ ...current, dependents: Math.max(0, Math.floor(dependents)) }));
        }}
        hint={`Con uno o más: 10 % de tus ingresos brutos laborales, hasta ${formatNumber(taxYear.labor.dependentUvt)} UVT. Hoy suma ${formatCurrency(result.labor.dependent)}. También alimenta las casillas 138 y 139.`}
      />
      <MoneyField
        name='prepaidHealthPaid'
        label='Medicina prepagada'
        value={values.prepaidHealthPaid}
        onChange={prepaidHealthPaid => {
          setValues(current => ({ ...current, prepaidHealthPaid }));
        }}
        hint={`Hasta 16 UVT al mes, ${formatCurrency(uvtToPesos(taxYear.labor.prepaidHealthUvt, taxYear))} al año.`}
      />
      {box.value - result.labor.dependent - result.labor.prepaidHealth > 0 && (
        <Text variant='note' className='text-fg-muted'>
          También suma {formatCurrency(box.value - result.labor.dependent - result.labor.prepaidHealth)} de
          GMF, ICETEX o aportes a cesantías como independiente. Los editas en Deducciones.
        </Text>
      )}
      <Footer onClose={onClose} onSave={save} canSave={isDirty} />
    </>
  );
};

const ExemptDetail = ({ form, box, onClose }: { form: Form210; box: Form210Box; onClose: () => void }) => {
  const { taxYear } = useTaxYear();
  const { result } = useDeclaration();
  const { labor } = result;
  const { detail, columns } = result.benefits;

  return (
    <>
      <TotalCard form={form} box={box} total={box.value} />
      <Text variant='body-m' className='text-fg-secondary'>
        {boxDescription(36, taxYear)}
      </Text>
      <div className='flex flex-col'>
        <CalcRow label='Cesantías exentas' value={detail.severanceExempt} />
        <CalcRow label='Otras rentas exentas de tu trabajo' value={detail.otherLaborExempt} />
        {columns.labor.unlimitedExempt > 0 && (
          <CalcRow label='Rentas exentas sin el tope del 40 %' value={columns.labor.unlimitedExempt} />
        )}
        <CalcRow
          label={`25 %, hasta ${formatNumber(taxYear.labor.exempt25Uvt)} UVT`}
          value={labor.exempt25}
        />
        <CalcRow variant='total' label='Casilla 36' value={columns.labor.otherExempt} />
      </div>
      <Text variant='note' className='text-fg-muted'>
        Se calcula sola con lo que escribiste en Deducciones.
      </Text>
      <Footer onClose={onClose} />
    </>
  );
};
