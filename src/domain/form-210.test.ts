import { sampleDeclaration } from '@/mocks/sample-declaration';

import { computeDeclaration } from './declaration';
import { buildForm210, findDependentBoxes, scheduleColumnOf } from './form-210';

const result = computeDeclaration(sampleDeclaration);
const form = buildForm210(sampleDeclaration, result);
const value = (box: number) => form.get(box)?.value;

describe('buildForm210', () => {
  it('fills the boxes of the sample taxpayer as in Figma', () => {
    expect(value(29)).toBe(328_500_000);
    expect(value(31)).toBe(208_500_000);
    expect(value(32)).toBe(180_000_000);
    expect(value(36)).toBe(31_650_000);
    expect(value(39)).toBe(22_800_000);
    expect(value(40)).toBe(37_200_000);
    expect(value(41)).toBe(65_520_000);
    expect(value(42)).toBe(98_280_000);
    expect(value(92)).toBe(65_520_000);
    expect(value(97)).toBe(98_280_000);
    expect(value(116)).toBe(9_591_000);
    expect(value(132)).toBe(11_240_000);
    expect(value(137)).toBe(1_649_000);
    expect(value(136)).toBe(0);
  });

  it('keeps the formulas consistent with the values', () => {
    expect(value(31)).toBe((value(29) ?? 0) - (value(30) ?? 0));
    expect(value(34)).toBe((value(32) ?? 0) - (value(33) ?? 0));
    expect(value(42)).toBe((value(34) ?? 0) - (value(41) ?? 0));
    expect(value(93)).toBe((value(91) ?? 0) - (value(92) ?? 0));
  });

  it('marks boxes 77 and above as not verified yet', () => {
    expect(form.get(76)?.verified).toBe(true);
    expect(form.get(77)?.verified).toBe(false);
  });

  it('labels matrix boxes with row and column', () => {
    expect(form.get(43)?.label).toBe('Ingresos brutos por honorarios y servicios');
    expect(scheduleColumnOf(43)).toBe('Honorarios y servicios');
    expect(scheduleColumnOf(29)).toBeUndefined();
    expect(form.get(32)?.note).toBe('6 conceptos');
  });

  it('finds the boxes fed by a box', () => {
    expect(findDependentBoxes(form, 32).map(box => box.number)).toEqual([34]);
    expect(findDependentBoxes(form, 34).map(box => box.number)).toEqual([42, 91]);
  });

  it('highlights the balance in favor', () => {
    expect(form.get(137)?.kind).toBe('highlighted');
    expect(form.get(136)?.kind).toBe('calculated');
  });
});
