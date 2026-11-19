import { FAQ_ITEMS, searchFaq } from './help-content';

describe('searchFaq', () => {
  it('returns everything without a query', () => {
    expect(searchFaq('  ')).toHaveLength(FAQ_ITEMS.length);
  });

  it('ignores accents and case and matches keywords', () => {
    expect(searchFaq('RETENCION').map(item => item.id)).toContain('withholding');
    expect(searchFaq('casilla 139').map(item => item.id)).toEqual(['dependents']);
  });

  it('needs every word', () => {
    expect(searchFaq('vehículo avalúo').map(item => item.id)).toEqual(['review', 'vehicle']);
    expect(searchFaq('zzz')).toEqual([]);
  });
});
