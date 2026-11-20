import { acceptTerms, hasAcceptedTerms, TERMS_KEY } from './terms-acceptance';

describe('terms acceptance', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('is pending until the person accepts', () => {
    expect(hasAcceptedTerms()).toBe(false);
    acceptTerms(new Date('2026-11-20T07:00:00Z'));
    expect(hasAcceptedTerms()).toBe(true);
  });

  it('asks again when the terms change', () => {
    window.localStorage.setItem(TERMS_KEY, JSON.stringify({ version: '2020-01-01' }));
    expect(hasAcceptedTerms()).toBe(false);
    window.localStorage.setItem(TERMS_KEY, '{not json');
    expect(hasAcceptedTerms()).toBe(false);
  });
});
