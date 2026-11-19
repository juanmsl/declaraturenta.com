import { getInitials, splitDianName } from './taxpayer';

describe('getInitials', () => {
  it('takes the first letter of the first two names', () => {
    expect(getInitials('Laura Gómez')).toBe('LG');
    expect(getInitials('  laura   maría gómez ')).toBe('LM');
  });
});

describe('splitDianName', () => {
  it('puts the given names first (DIAN writes surnames first)', () => {
    expect(splitDianName('GOMEZ RUIZ LAURA MARIA')).toEqual({
      firstName: 'Laura',
      fullName: 'Laura Maria Gomez Ruiz',
    });
    expect(splitDianName('GOMEZ LAURA')).toEqual({ firstName: 'Laura', fullName: 'Laura Gomez' });
  });
});
