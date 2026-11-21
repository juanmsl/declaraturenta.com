import { LuPlus, LuTrash2 } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import type { DeclarationData } from '@/domain/declaration';
import { occasionalGainExempt } from '@/domain/other-schedules';
import type { DividendKind, OccasionalGainConcept, OccasionalGainKind } from '@/domain/other-schedules';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Button, MoneyField, SelectField, Text, TextField, ToggleField } from '@/shared/ui';

import {
  ADJUSTMENT,
  ADJUSTMENT_ID,
  EXOGENOUS_ORIGIN,
  isFromExogenous,
  SCHEDULE_IDS,
  totalOf,
  withTotal,
} from './income-concepts';

const DIVIDEND_FIELDS: readonly { kind: DividendKind; label: string; hint: string }[] = [
  {
    kind: 'first-subcedule',
    label: 'Dividendos no gravados, 2017 y siguientes (casilla 107)',
    hint: 'Tu certificado los llama «no gravados» o «numeral 3 del artículo 49».',
  },
  {
    kind: 'second-subcedule',
    label: 'Dividendos gravados, 2017 y siguientes (casilla 108)',
    hint: 'Pagan 35 % primero; lo que queda suma a tu renta. Son los del «parágrafo 2 del artículo 49».',
  },
  {
    kind: 'until-2016-non-taxed',
    label: 'Dividendos no gravados de utilidades de 2016 y antes (casillas 104 y 105)',
    hint: 'No pagan impuesto, pero se declaran.',
  },
  {
    kind: 'until-2016-taxed',
    label: 'Dividendos gravados de utilidades de 2016 y antes (casilla 104)',
    hint: 'Se liquidan con la tabla vigente hasta 2016.',
  },
  {
    kind: 'foreign',
    label: 'Dividendos recibidos del exterior (casilla 109)',
    hint: 'Pagan 35 %.',
  },
];

const GAIN_KINDS: readonly { value: OccasionalGainKind; label: string }[] = [
  { value: 'lottery', label: 'Lotería, rifa o apuesta' },
  { value: 'asset-sale', label: 'Venta de un bien que tuviste 2 años o más' },
  { value: 'home-sale', label: 'Venta de tu vivienda' },
  { value: 'inherited-home', label: 'Herencia: vivienda de quien falleció' },
  { value: 'inherited-real-estate', label: 'Herencia: otro inmueble' },
  { value: 'inheritance', label: 'Herencia o legado: otros bienes' },
  { value: 'gift', label: 'Donación recibida' },
  { value: 'life-insurance', label: 'Seguro de vida' },
  { value: 'personal-effects', label: 'Herencia: ropa, libros y muebles de la casa' },
  { value: 'other', label: 'Otra ganancia ocasional' },
];

const isSale = (kind: OccasionalGainKind) => kind === 'asset-sale' || kind === 'home-sale';

/** Pensions, dividends and occasional gains, each behind its own switch (ADR 0031). */
export const OtherSchedulesSection = () => {
  return (
    <section className='flex flex-col gap-5' aria-labelledby='other-schedules-title'>
      <div className='flex flex-col gap-1'>
        <Text id='other-schedules-title' variant='title-s' as='h2'>
          Pensiones, dividendos y ganancias ocasionales
        </Text>
        <Text variant='body-m' className='text-fg-secondary'>
          Actívalos solo si los tuviste. Cada uno se declara en su propia cédula.
        </Text>
      </div>

      <ScheduleSection schedule='pensions' />
      <ScheduleSection schedule='dividends' />
      <ScheduleSection schedule='occasionalGains' />
    </section>
  );
};

type Schedule = keyof typeof SCHEDULE_IDS;

const SCHEDULES: Record<Schedule, { label: string; description: string }> = {
  pensions: {
    label: 'Recibí una pensión',
    description: 'De jubilación, vejez, invalidez o sobrevivientes, del país o del exterior.',
  },
  dividends: {
    label: 'Recibí dividendos o participaciones',
    description: 'Pagos de utilidades de empresas en las que tienes acciones o cuotas.',
  },
  occasionalGains: {
    label: 'Tuve ganancias ocasionales',
    description:
      'Herencias, donaciones, loterías, seguros de vida o la venta de bienes que tuviste 2 años o más.',
  },
};

/** One schedule behind its switch; also used in the box panel of the 210 (ADR 0047). */
export const ScheduleSection = ({ schedule }: { schedule: Schedule }) => {
  const { state, dispatch } = useDeclaration();
  const id = SCHEDULE_IDS[schedule];
  const isActive = state.activeSchedules.includes(id);

  return (
    <>
      <ToggleField
        name={id}
        label={SCHEDULES[schedule].label}
        description={SCHEDULES[schedule].description}
        checked={isActive}
        onChange={() => {
          dispatch({ type: 'toggleSchedule', scheduleId: id });
        }}
      />
      {isActive && schedule === 'pensions' && <PensionFields />}
      {isActive && schedule === 'dividends' && <DividendFields />}
      {isActive && schedule === 'occasionalGains' && <OccasionalGainsEditor />}
    </>
  );
};

const Indented = ({ children }: { children: React.ReactNode }) => (
  <div className='-mt-2 flex flex-col gap-5 border-l-2 border-line pl-5'>{children}</div>
);

const PensionFields = () => {
  const { taxYear } = useTaxYear();
  const { state, dispatch, result } = useDeclaration();
  const { pensions } = state.data;
  const update = (patch: Partial<DeclarationData['pensions']>) => {
    dispatch({ type: 'updateData', update: data => ({ ...data, pensions: { ...data.pensions, ...patch } }) });
  };

  return (
    <Indented>
      <MoneyField
        name='pensionIncome'
        label='Pensiones recibidas en el año (casilla 99)'
        value={totalOf(pensions.concepts)}
        onChange={total => {
          update({ concepts: withTotal(pensions.concepts, total, ADJUSTMENT) });
        }}
        origin={isFromExogenous(pensions.concepts) ? EXOGENOUS_ORIGIN : undefined}
      />
      <MoneyField
        name='pensionNonTaxableIncome'
        label='Aportes a salud y fondo de solidaridad descontados (casilla 100)'
        value={pensions.nonTaxableIncome}
        onChange={nonTaxableIncome => {
          update({ nonTaxableIncome });
        }}
        hint='Aparecen en el certificado de tu fondo de pensiones.'
      />
      <MoneyField
        name='pensionMonths'
        label='Meses en que recibiste pensión'
        currency={false}
        value={pensions.months}
        onChange={months => {
          update({ months: Math.min(12, Math.max(0, Math.round(months))) });
        }}
        hint={`Hasta ${formatNumber(taxYear.pensions.exemptMonthlyUvt)} UVT por mes están exentas. De tu pensión, ${formatCurrency(result.pensions.exemptIncome)} no pagan impuesto.`}
      />
    </Indented>
  );
};

const DividendFields = () => {
  const { state, dispatch } = useDeclaration();
  const { concepts } = state.data.dividends;

  const setKindTotal = (kind: DividendKind, total: number) => {
    dispatch({
      type: 'updateData',
      update: data => {
        const others = data.dividends.concepts.filter(concept => concept.kind !== kind);
        const ofKind = data.dividends.concepts.filter(concept => concept.kind === kind);
        const updated = withTotal(ofKind, total, { ...ADJUSTMENT, kind });
        return {
          ...data,
          dividends: {
            concepts: [
              ...others,
              ...updated.map(c => (c.id === ADJUSTMENT_ID ? { ...c, id: `adjustment-${kind}` } : c)),
            ],
          },
        };
      },
    });
  };

  return (
    <Indented>
      <Text variant='body-m' className='text-fg-secondary'>
        La empresa que te pagó te da un certificado que dice qué parte es gravada y de qué años son las
        utilidades. Si no lo tienes, pídeselo antes de seguir.
      </Text>
      {DIVIDEND_FIELDS.map(field => {
        const ofKind = concepts.filter(concept => concept.kind === field.kind);
        return (
          <MoneyField
            key={field.kind}
            name={`dividends-${field.kind}`}
            label={field.label}
            value={totalOf(ofKind)}
            onChange={total => {
              setKindTotal(field.kind, total);
            }}
            origin={isFromExogenous(ofKind) ? EXOGENOUS_ORIGIN : undefined}
            hint={field.hint}
          />
        );
      })}
    </Indented>
  );
};

const OccasionalGainsEditor = () => {
  const { taxYear } = useTaxYear();
  const { state, dispatch, result } = useDeclaration();
  const { concepts } = state.data.occasionalGains;

  const setConcepts = (update: (list: OccasionalGainConcept[]) => OccasionalGainConcept[]) => {
    dispatch({
      type: 'updateData',
      update: data => ({ ...data, occasionalGains: { concepts: update(data.occasionalGains.concepts) } }),
    });
  };
  const patch = (id: string, change: Partial<OccasionalGainConcept>) => {
    setConcepts(list => list.map(concept => (concept.id === id ? { ...concept, ...change } : concept)));
  };
  const add = () => {
    setConcepts(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        label: '',
        entity: '',
        kind: 'inheritance',
        amount: 0,
        cost: 0,
        origin: 'user',
      },
    ]);
  };

  return (
    <Indented>
      {concepts.map((concept, index) => (
        <div key={concept.id} className='flex flex-col gap-4 rounded-lg border border-line bg-surface p-5'>
          <div className='flex items-center justify-between gap-3'>
            <Text variant='body-m-strong'>Ganancia ocasional {index + 1}</Text>
            <Button
              variant='ghost'
              icon={LuTrash2}
              onClick={() => {
                setConcepts(list => list.filter(item => item.id !== concept.id));
              }}
            >
              Quitar
            </Button>
          </div>
          <SelectField
            name={`gain-kind-${concept.id}`}
            label='¿Qué fue?'
            value={concept.kind}
            options={GAIN_KINDS}
            onChange={kind => {
              patch(concept.id, { kind, ...(isSale(kind) ? {} : { cost: 0, toAfcOrMortgage: false }) });
            }}
          />
          <TextField
            name={`gain-label-${concept.id}`}
            label='Descripción'
            placeholder='Por ejemplo, apartamento heredado de mi papá'
            value={concept.label}
            onChange={label => {
              patch(concept.id, { label });
            }}
          />
          <MoneyField
            name={`gain-amount-${concept.id}`}
            label={
              isSale(concept.kind)
                ? 'Precio de venta'
                : concept.kind === 'lottery'
                  ? 'Valor del premio antes de la retención'
                  : 'Valor recibido'
            }
            value={concept.amount}
            onChange={amount => {
              patch(concept.id, { amount });
            }}
            hint={`Exenta: ${formatCurrency(occasionalGainExempt(concept, taxYear))}${concept.kind === 'lottery' ? '. Paga 20 %.' : '. El resto paga 15 %.'}`}
          />
          {isSale(concept.kind) && (
            <MoneyField
              name={`gain-cost-${concept.id}`}
              label='Costo fiscal del bien'
              value={concept.cost}
              onChange={cost => {
                patch(concept.id, { cost });
              }}
              hint='Lo que te costó, con los ajustes que permite la ley. Lo restamos del precio.'
            />
          )}
          {concept.kind === 'home-sale' && (
            <ToggleField
              name={`gain-afc-${concept.id}`}
              label='Deposité el dinero en una cuenta AFC o pagué el crédito de esa vivienda'
              description='Con esto, las primeras 5.000 UVT de la utilidad están exentas.'
              checked={concept.toAfcOrMortgage === true}
              onChange={toAfcOrMortgage => {
                patch(concept.id, { toAfcOrMortgage });
              }}
            />
          )}
        </div>
      ))}
      <div>
        <Button variant='secondary' icon={LuPlus} onClick={add}>
          Agregar ganancia ocasional
        </Button>
      </div>
      {concepts.length > 0 && (
        <Text variant='note' className='text-fg-muted'>
          Ganancia gravable {formatCurrency(result.occasionalGains.taxable)} · impuesto de ganancias
          ocasionales {formatCurrency(result.occasionalGains.tax)} (casilla 127).
        </Text>
      )}
    </Indented>
  );
};
