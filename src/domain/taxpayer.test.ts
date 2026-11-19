import { getInitials } from './taxpayer';

describe('getInitials', () => {
  it('takes the first letter of the first two names', () => {
    expect(getInitials('Laura Gómez')).toBe('LG');
    expect(getInitials('  laura   maría gómez ')).toBe('LM');
  });
});
