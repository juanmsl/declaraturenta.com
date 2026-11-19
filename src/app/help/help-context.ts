import { createContext, useContext } from 'react';

export type HelpTab = 'guide' | 'faq';

export type HelpContextValue = {
  openHelp: (tab?: HelpTab) => void;
};

export const HelpContext = createContext<HelpContextValue | null>(null);

/** Opens the help panel (ADR 0028). */
export const useHelp = (): HelpContextValue => {
  const value = useContext(HelpContext);
  if (!value) throw new Error('useHelp must be used inside HelpProvider');
  return value;
};
