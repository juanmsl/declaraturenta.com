import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useDeclaration } from '@/app/declaration/declaration-context';
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
import { findDependentBoxes, scheduleColumnOf } from '@/domain/form-210';
import { uvtToPesos } from '@/domain/uvt';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Alert, Button, CalcRow, Chip, Drawer, MoneyField, Text } from '@/shared/ui';

import { ConceptsEditor } from './ConceptsEditor';
import { sectionOf } from './sections';

type ScreenLink = { screen: string; path: string; section: string };

const income = (section: string, anchor: string): ScreenLink => ({
  screen: 'Ingresos',
  path: `/ingresos#${anchor}`,
  section,
});
const adjustments = (section: string): ScreenLink => ({
  screen: 'Otros ajustes',
  path: '/otros-ajustes',
  section,
});

/** Boxes filled from a section of another screen (ADRs 0031, 0032 and 0038). */
const SCREEN_BOXES: Partial<Record<number, ScreenLink>> = {
  43: income('Honorarios y servicios', 'fees-title'),
  44: income('Honorarios y servicios', 'fees-title'),
  45: income('Honorarios y servicios', 'fees-title'),
  60: income('Rendimientos financieros y otros ingresos', 'other-income-title'),
  75: income('Rendimientos financieros y otros ingresos', 'other-income-title'),
  76: income('Rendimientos financieros y otros ingresos', 'other-income-title'),
  77: income('Rendimientos financieros y otros ingresos', 'other-income-title'),
  99: income('Recibí una pensión', 'other-schedules-title'),
  100: income('Recibí una pensión', 'other-schedules-title'),
  104: income('Recibí dividendos o participaciones', 'other-schedules-title'),
  105: income('Recibí dividendos o participaciones', 'other-schedules-title'),
  107: income('Recibí dividendos o participaciones', 'other-schedules-title'),
  108: income('Recibí dividendos o participaciones', 'other-schedules-title'),
  109: income('Recibí dividendos o participaciones', 'other-schedules-title'),
  112: income('Tuve ganancias ocasionales', 'other-schedules-title'),
  113: income('Tuve ganancias ocasionales', 'other-schedules-title'),
  114: income('Tuve ganancias ocasionales', 'other-schedules-title'),
  56: adjustments('Tengo pérdidas fiscales de años anteriores'),
  72: adjustments('Tengo pérdidas fiscales de años anteriores'),
  89: adjustments('Tengo pérdidas fiscales de años anteriores'),
  94: adjustments('Tengo pérdidas fiscales de años anteriores'),
  95: adjustments('Tuve excesos de renta presuntiva'),
  96: adjustments('Debo sumar rentas gravables'),
  62: adjustments('Tengo rentas pasivas de una sociedad del exterior (ECE)'),
  79: adjustments('Tengo rentas pasivas de una sociedad del exterior (ECE)'),
  110: adjustments('Recibí dividendos de un país de la Comunidad Andina'),
  141: { screen: 'Resultado', path: '/resultado', section: '¿Cuándo vas a presentar?' },
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
  const link = SCREEN_BOXES[box.number];
  if (link) return <ScreenDetail form={form} box={box} link={link} onClose={onClose} />;

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

const ScreenDetail = ({
  form,
  box,
  link,
  onClose,
}: {
  form: Form210;
  box: Form210Box;
  link: ScreenLink;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  return (
    <>
      <TotalCard form={form} box={box} total={box.value} />
      <Alert variant='info' title={`Sale de lo que escribiste en ${link.screen}`}>
        La llenas en «{link.section}». Allí aplicamos también los límites de la ley.
      </Alert>
      <div>
        <Button
          variant='secondary'
          onClick={() => {
            onClose();
            void navigate(link.path);
          }}
        >
          Ir a {link.screen}
        </Button>
      </div>
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
