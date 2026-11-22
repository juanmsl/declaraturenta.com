import { useEffect } from 'react';
import { LuFileText, LuList } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { Button } from 'polpo/components';
import { useLocation, useNavigate } from 'react-router';

import { Icon } from '@/shared/ui';

import { useDeclaration } from '../declaration/declaration-context';
import { FORM_210_PATH, findResumeStep } from '../flow';

type View = 'steps' | 'form-210';

const VIEWS: readonly { id: View; label: string; icon: IconType }[] = [
  { id: 'steps', label: 'Pasos', icon: LuList },
  { id: 'form-210', label: 'Formulario 210', icon: LuFileText },
];

/** Where the person was in the steps, to come back from the 210 (only for this browser tab). */
const LAST_STEP_KEY = 'declaraturenta:last-step-path';

const readLastStep = (): string | null => {
  try {
    return window.sessionStorage.getItem(LAST_STEP_KEY);
  } catch {
    return null;
  }
};

/**
 * «Pasos | Formulario 210» (Figma «Selector de vista», ADR 0056): the two ways to fill the same
 * return, as two Polpo buttons (Polpo Tabs kept the page from changing route in the top bar). In the steps it remembers the page; «Pasos» from the 210 goes back to it, or to the step
 * to resume when there is none.
 */
export const ViewSwitcher = ({ view }: { view: View }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = useDeclaration();

  useEffect(() => {
    if (view !== 'steps') return;
    try {
      window.sessionStorage.setItem(LAST_STEP_KEY, pathname);
    } catch {
      // Storage can be unavailable; «Pasos» then goes to the step to resume.
    }
  }, [view, pathname]);

  const go = (id: View) => {
    if (id === view) return;
    void navigate(
      id === 'form-210' ? FORM_210_PATH : (readLastStep() ?? findResumeStep(state.completedSteps).path),
    );
  };

  return (
    <nav aria-label='Cómo llenar tu declaración' className='flex shrink-0 items-center gap-1'>
      {VIEWS.map(item => {
        const isActive = item.id === view;
        return (
          <Button
            key={item.id}
            type='button'
            color='primary'
            variant={isActive ? 'flat' : 'text'}
            size='small'
            aria-current={isActive ? 'page' : undefined}
            className={isActive ? 'bg-action-soft' : undefined}
            onClick={() => {
              go(item.id);
            }}
          >
            <span className='flex items-center gap-1.5'>
              <Icon icon={item.icon} size={16} />
              {item.label}
            </span>
          </Button>
        );
      })}
    </nav>
  );
};
