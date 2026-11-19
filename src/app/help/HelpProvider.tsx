import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { HelpDrawer } from '@/features/help/HelpDrawer';

import { HelpContext } from './help-context';
import type { HelpTab } from './help-context';

/** Holds the help panel so the top bar and Inicio can open it. */
export const HelpProvider = ({ children }: { children: ReactNode }) => {
  const [openTab, setOpenTab] = useState<HelpTab | null>(null);
  const value = useMemo(
    () => ({
      openHelp: (tab: HelpTab = 'guide') => {
        setOpenTab(tab);
      },
    }),
    [],
  );

  return (
    <HelpContext.Provider value={value}>
      {children}
      <HelpDrawer
        tab={openTab}
        onClose={() => {
          setOpenTab(null);
        }}
      />
    </HelpContext.Provider>
  );
};
