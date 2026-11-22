import { Button } from '@/shared/ui';

import { useHelp } from '../help/help-context';

/** «Ayuda» in the top bars: opens the help panel on the guide. */
export const HelpButton = () => {
  const { openHelp } = useHelp();
  return (
    <Button
      variant='ghost'
      type='button'
      className='shrink-0'
      onClick={() => {
        openHelp('guide');
      }}
    >
      Ayuda
    </Button>
  );
};
