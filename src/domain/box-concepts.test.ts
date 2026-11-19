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
});
