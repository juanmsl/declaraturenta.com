import { Document, Font, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import bricolage600 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff?url';
import figtree400 from '@fontsource/figtree/files/figtree-latin-400-normal.woff?url';
import figtree500 from '@fontsource/figtree/files/figtree-latin-500-normal.woff?url';
import figtree600 from '@fontsource/figtree/files/figtree-latin-600-normal.woff?url';
import figtree700 from '@fontsource/figtree/files/figtree-latin-700-normal.woff?url';

import { SCHEDULE_COLUMNS, SCHEDULE_ROWS } from '@/domain/form-210';
import type { Form210Box } from '@/domain/form-210';
import type { Taxpayer } from '@/domain/taxpayer';
import { formatCurrency, formatLongDate, formatNumber } from '@/shared/lib/format';

import type { DraftRow } from '../draft-rows';

Font.register({
  family: 'Figtree',
  fonts: [
    { src: figtree400, fontWeight: 400 },
    { src: figtree500, fontWeight: 500 },
    { src: figtree600, fontWeight: 600 },
    { src: figtree700, fontWeight: 700 },
  ],
});
Font.register({ family: 'Bricolage Grotesque', fonts: [{ src: bricolage600, fontWeight: 600 }] });
Font.registerHyphenationCallback(word => [word]);

// Figma tokens (react-pdf cannot read CSS variables).
const C = {
  ink: '#17162b',
  secondary: '#3b3a55',
  muted: '#62617c',
  line: '#e4e3ee',
  subtle: '#efeef6',
  actionSoft: '#ece9ff',
  action: '#4230d1',
  violet: '#5b47f0',
  weave: '#e4e3ee',
  mintSoft: '#ddf8ef',
  coralSoft: '#ffe6e7',
};

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 44, fontFamily: 'Figtree', fontSize: 10, color: C.ink },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandName: { fontFamily: 'Bricolage Grotesque', fontWeight: 600, fontSize: 13 },
  title: { fontFamily: 'Bricolage Grotesque', fontWeight: 600, fontSize: 20, marginTop: 18 },
  meta: { color: C.muted, marginTop: 4 },
  notice: { backgroundColor: C.actionSoft, borderRadius: 8, padding: 10, marginTop: 14 },
  noticeTitle: { color: C.action, fontWeight: 600 },
  noticeText: { color: C.secondary, marginTop: 2 },
  table: { marginTop: 16, borderWidth: 1, borderColor: C.line, borderRadius: 8 },
  section: { backgroundColor: C.subtle, paddingVertical: 5, paddingHorizontal: 12 },
  sectionText: { color: C.secondary, fontWeight: 500, fontSize: 9 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  boxNumber: { width: 36, color: C.action, fontWeight: 700, fontSize: 9 },
  label: { flex: 1 },
  formula: { color: C.muted, fontSize: 8, marginTop: 1 },
  value: { width: 110, textAlign: 'right', fontWeight: 600 },
  h2: { fontFamily: 'Bricolage Grotesque', fontWeight: 600, fontSize: 15, marginTop: 22 },
  h2Note: { color: C.muted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: C.line },
  cell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  cellLabel: { flex: 1, fontSize: 8.5 },
  cellValue: { width: 82, textAlign: 'right', fontWeight: 600, fontSize: 9 },
  badge: {
    minWidth: 22,
    paddingVertical: 1.5,
    paddingHorizontal: 3,
    borderRadius: 4,
    backgroundColor: C.actionSoft,
    color: C.action,
    fontWeight: 700,
    fontSize: 7.5,
    textAlign: 'center',
  },
  matrixHead: {
    flexDirection: 'row',
    backgroundColor: C.subtle,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  matrixRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.line },
  matrixLabel: { width: 132, paddingVertical: 5, paddingHorizontal: 8, fontSize: 8 },
  matrixGroup: { color: C.muted, fontSize: 7, paddingTop: 5, paddingHorizontal: 8 },
  matrixCol: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 7.5,
    color: C.secondary,
    fontWeight: 500,
  },
  matrixCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderLeftWidth: 1,
    borderLeftColor: C.line,
  },
  matrixValue: { flex: 1, textAlign: 'right', fontWeight: 600, fontSize: 8 },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 44,
    right: 44,
    fontSize: 8,
    color: C.muted,
    flexDirection: 'row',
  },
});

const ISOTYPE_CELLS: [string, boolean][] = [
  ['M5 18.75L10 23.75L5 28.75L0 23.75L5 18.75Z', false],
  ['M11.25 25L16.25 30L11.25 35L6.25 30L11.25 25Z', true],
  ['M17.5 31.25L22.5 36.25L17.5 41.25L12.5 36.25L17.5 31.25Z', true],
  ['M23.75 37.5L28.75 42.5L23.75 47.5L18.75 42.5L23.75 37.5Z', false],
  ['M11.25 12.5L16.25 17.5L11.25 22.5L6.25 17.5L11.25 12.5Z', false],
  ['M17.5 18.75L22.5 23.75L17.5 28.75L12.5 23.75L17.5 18.75Z', false],
  ['M23.75 25L28.75 30L23.75 35L18.75 30L23.75 25Z', true],
  ['M30 31.25L35 36.25L30 41.25L25 36.25L30 31.25Z', false],
  ['M17.5 6.25L22.5 11.25L17.5 16.25L12.5 11.25L17.5 6.25Z', false],
  ['M23.75 12.5L28.75 17.5L23.75 22.5L18.75 17.5L23.75 12.5Z', false],
  ['M30 18.75L35 23.75L30 28.75L25 23.75L30 18.75Z', true],
  ['M36.25 25L41.25 30L36.25 35L31.25 30L36.25 25Z', false],
  ['M23.75 0L28.75 5L23.75 10L18.75 5L23.75 0Z', false],
  ['M30 6.25L35 11.25L30 16.25L25 11.25L30 6.25Z', false],
  ['M36.25 12.5L41.25 17.5L36.25 22.5L31.25 17.5L36.25 12.5Z', true],
  ['M42.5 18.75L47.5 23.75L42.5 28.75L37.5 23.75L42.5 18.75Z', false],
];

/** Same geometry as src/assets/brand/isotype-color.svg (exported from Figma). */
const Isotype = () => (
  <Svg width={20} height={20} viewBox='0 0 48 48'>
    {ISOTYPE_CELLS.map(([d, isCheck]) => (
      <Path key={d} d={d} fill={isCheck ? C.violet : C.weave} />
    ))}
  </Svg>
);

const FORM_SECTIONS: { title: string; from: number; to: number }[] = [
  { title: 'Datos generales y patrimonio', from: 28, to: 31 },
  { title: 'Cédula general', from: 32, to: 90 },
  { title: 'Renta líquida gravable de la cédula general', from: 91, to: 98 },
  { title: 'Otras cédulas e impuesto sobre la renta', from: 99, to: 121 },
  { title: 'Descuentos tributarios', from: 122, to: 125 },
  { title: 'Liquidación privada', from: 126, to: 133 },
  { title: 'Saldo', from: 134, to: 141 },
];

/** Box 138 is a count of people and box 140 a mark (X), not pesos. */
const boxValue = (box: Form210Box) => {
  if (box.number === 138) return formatNumber(box.value);
  if (box.number === 140) return box.value > 0 ? 'X' : '—';
  return formatCurrency(box.value);
};

/** One box of the table format: number, label and value. */
const BoxCell = ({ box }: { box: Form210Box }) => (
  <View style={s.cell} wrap={false}>
    <Text style={s.badge}>{box.number}</Text>
    <Text style={s.cellLabel}>{box.label}</Text>
    <Text style={[s.cellValue, box.kind === 'not-applicable' ? { color: C.muted } : {}]}>
      {boxValue(box)}
    </Text>
  </View>
);

/** Cédula general as in the 210: one row per concept and one column per kind of income. */
const ScheduleMatrix = ({ byNumber }: { byNumber: Map<number, Form210Box> }) => (
  <View>
    <View style={s.matrixHead} wrap={false}>
      <Text style={s.matrixLabel} />
      {SCHEDULE_COLUMNS.map(column => (
        <Text key={column} style={s.matrixCol}>
          {column}
        </Text>
      ))}
    </View>
    {SCHEDULE_ROWS.map((row, index) => {
      const showGroup = row.group !== undefined && row.group !== SCHEDULE_ROWS[index - 1]?.group;
      return (
        <View key={row.label} wrap={false}>
          {showGroup && <Text style={s.matrixGroup}>{row.group}</Text>}
          <View style={s.matrixRow}>
            <Text style={s.matrixLabel}>{row.label}</Text>
            {row.boxes.map((number, column) => {
              const box = number === null ? undefined : byNumber.get(number);
              return (
                <View key={column} style={s.matrixCell}>
                  {box && (
                    <>
                      <Text style={s.badge}>{box.number}</Text>
                      <Text style={s.matrixValue}>{formatCurrency(box.value)}</Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      );
    })}
  </View>
);

/**
 * The 210 in table format, like the Formulario 210 screen (09): each section as a grid of boxes and
 * the cédula general as a matrix (ADR 0059).
 */
const Form210Table = ({ boxes }: { boxes: Form210Box[] }) => {
  const byNumber = new Map(boxes.map(box => [box.number, box]));
  return (
    <View style={s.table}>
      {FORM_SECTIONS.map(section => (
        <View key={section.title}>
          {/* Keeps a section title from ending a page alone. */}
          <View style={s.section} wrap={false} minPresenceAhead={60}>
            <Text style={s.sectionText}>{section.title}</Text>
          </View>
          {section.from === 32 ? (
            <ScheduleMatrix byNumber={byNumber} />
          ) : (
            <View style={s.grid}>
              {boxes
                .filter(box => box.number >= section.from && box.number <= section.to)
                .map(box => (
                  <BoxCell key={box.number} box={box} />
                ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

type DraftDocumentProps = {
  taxpayer: Taxpayer;
  rows: DraftRow[];
  boxes: Form210Box[];
  generatedAt: Date;
  year: number;
};

/**
 * PDF of the draft: summary (screen 08), every box of the 210 (ADR 0019) and the 210 in table
 * format (ADR 0059).
 */
export const DraftDocument = ({ taxpayer, rows, boxes, generatedAt, year }: DraftDocumentProps) => (
  <Document
    title={`Borrador Formulario 210 · Año gravable ${String(year)}`}
    author='Declara tu renta'
    language='es-CO'
  >
    <Page size='LETTER' style={s.page}>
      <View style={s.brand}>
        <Isotype />
        <Text style={s.brandName}>Declara tu renta</Text>
      </View>
      <Text style={s.title}>Tu borrador del Formulario 210 · Año gravable {year}</Text>
      <Text style={s.meta}>
        {[
          taxpayer.fullName,
          taxpayer.nitLastDigits ? `NIT terminado en ${taxpayer.nitLastDigits}` : null,
          taxpayer.filingDeadline ? `Fecha límite: ${formatLongDate(taxpayer.filingDeadline)}` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      <View style={s.notice}>
        <Text style={s.noticeTitle}>Esto es un borrador</Text>
        <Text style={s.noticeText}>
          La declaración se presenta y firma en el portal de la DIAN con tu firma electrónica. Aquí solo la
          preparas y la revisas.
        </Text>
      </View>

      <View style={s.table}>
        {rows.map((row, index) => {
          if (row.type === 'section') {
            return (
              <View key={row.label} style={s.section}>
                <Text style={s.sectionText}>{row.label}</Text>
              </View>
            );
          }
          const isTotal = row.type === 'total';
          return (
            <View
              key={`${String(row.box)}-${String(index)}`}
              style={[
                s.row,
                isTotal
                  ? { backgroundColor: row.toPay ? C.coralSoft : C.mintSoft, borderBottomWidth: 0 }
                  : {},
              ]}
            >
              <Text style={s.boxNumber}>{row.box}</Text>
              <Text style={[s.label, isTotal || row.strong === true ? { fontWeight: 600 } : {}]}>
                {row.label}
              </Text>
              <Text style={[s.value, isTotal ? { fontSize: 13 } : {}]}>{formatCurrency(row.value)}</Text>
            </View>
          );
        })}
      </View>

      <Text style={s.h2} break>
        Formulario 210 · todas las casillas
      </Text>
      <View style={s.table}>
        {FORM_SECTIONS.map(section => (
          <View key={section.title}>
            <View style={s.section} wrap={false}>
              <Text style={s.sectionText}>{section.title}</Text>
            </View>
            {boxes
              .filter(box => box.number >= section.from && box.number <= section.to)
              .map(box => (
                <View key={box.number} style={s.row} wrap={false}>
                  <Text style={s.boxNumber}>{box.number}</Text>
                  <View style={s.label}>
                    <Text>{box.label}</Text>
                    {box.formula && <Text style={s.formula}>{box.formula}</Text>}
                  </View>
                  <Text style={[s.value, box.kind === 'not-applicable' ? { color: C.muted } : {}]}>
                    {boxValue(box)}
                  </Text>
                </View>
              ))}
          </View>
        ))}
      </View>

      <Text style={s.h2} break>
        Formulario 210 · formato de tabla
      </Text>
      <Text style={s.h2Note}>
        Las mismas casillas, ordenadas como en el formulario de la DIAN, para transcribirlas en el portal.
      </Text>
      <Form210Table boxes={boxes} />

      <View style={s.footer} fixed>
        <Text style={{ flex: 1 }}>
          Generado el {formatLongDate(generatedAt.toISOString().slice(0, 10))} con Declara tu renta.
        </Text>
        <Text render={({ pageNumber, totalPages }) => `${String(pageNumber)} / ${String(totalPages)}`} />
      </View>
    </Page>
  </Document>
);
