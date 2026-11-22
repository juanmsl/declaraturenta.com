import { sampleDeclaration } from '@/mocks/sample-declaration';

import { applyBoxConcepts, editConcept, getBoxConcepts } from './box-concepts';

describe('box concepts', () => {
  it('lists the six concepts of box 32 and round-trips them', () => {
    const concepts = getBoxConcepts(32, sampleDeclaration);
    expect(concepts).toHaveLength(6);
    expect(applyBoxConcepts(32, sampleDeclaration, concepts)).toEqual(sampleDeclaration);
  });

  it('updates salaries and keeps what the exogenous report said', () => {
    const [salary, ...rest] = getBoxConcepts(32, sampleDeclaration);
    if (!salary) throw new Error('missing concept');
    const edited = editConcept(salary, { amount: 150_000_000 });
    expect(edited.origin).toBe('user');
    expect(edited.exogenousAmount).toBe(146_000_000);
    const data = applyBoxConcepts(32, sampleDeclaration, [edited, ...rest]);
    expect(data.labor.salaries).toBe(184_000_000);
  });

  it('adds a new asset as user data', () => {
    const data = applyBoxConcepts(29, sampleDeclaration, [
      ...getBoxConcepts(29, sampleDeclaration),
      { id: 'car', label: 'Carro', detail: '', amount: 40_000_000, origin: 'user' },
    ]);
    expect(data.assets).toHaveLength(3);
    expect(data.assets[2]?.kind).toBe('other');
  });

  it('sums single-total boxes', () => {
    const data = applyBoxConcepts(132, sampleDeclaration, [
      { id: 'a', label: 'Retención', detail: '', amount: 10_000_000, origin: 'user' },
      { id: 'b', label: 'Otra retención', detail: '', amount: 2_000_000, origin: 'user' },
    ]);
    expect(data.withholdings).toBe(12_000_000);
  });

  it('adds concepts to boxes 60, 75, 76 and 77, each with its own total (ADR 0052)', () => {
    const concept = (id: string, amount: number) => ({
      id,
      label: id,
      detail: '',
      amount,
      origin: 'user' as const,
    });
    let data = applyBoxConcepts(60, sampleDeclaration, [concept('a', 100_000), concept('b', 50_000)]);
    data = applyBoxConcepts(75, data, [concept('c', 20_000)]);
    data = applyBoxConcepts(76, data, [concept('d', 30_000)]);
    data = applyBoxConcepts(77, data, [concept('e', 40_000), concept('f', 5_000)]);
    expect(getBoxConcepts(60, data).map(item => item.amount)).toEqual([100_000, 50_000]);
    expect(data.nonLabor.returnConcepts).toHaveLength(1);
    expect(data.nonLabor.contributionConcepts[0]?.amount).toBe(30_000);
    expect(getBoxConcepts(77, data)).toHaveLength(2);
    // Box 74 is not touched by its sibling boxes.
    expect(data.nonLabor.concepts).toEqual(sampleDeclaration.nonLabor.concepts);
  });

  it('adds concepts to the loss boxes and to boxes 95 and 96 (ADR 0055)', () => {
    const concept = (id: string, amount: number) => ({
      id,
      label: id,
      detail: '',
      amount,
      origin: 'user' as const,
    });
    let data = applyBoxConcepts(72, sampleDeclaration, [
      concept('2022', 5_000_000),
      concept('2023', 1_000_000),
    ]);
    data = applyBoxConcepts(94, data, [concept('2017', 2_000_000)]);
    data = applyBoxConcepts(96, data, [concept('omitted', 3_000_000)]);
    expect(data.adjustments.losses.capital.map(item => item.amount)).toEqual([5_000_000, 1_000_000]);
    expect(data.adjustments.losses.fees).toEqual([]);
    expect(getBoxConcepts(94, data)).toHaveLength(1);
    expect(getBoxConcepts(95, data)).toEqual([]);
    expect(data.adjustments.taxableAdditionConcepts[0]?.amount).toBe(3_000_000);
  });
});
