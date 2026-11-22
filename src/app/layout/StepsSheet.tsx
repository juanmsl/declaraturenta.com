import { Sheet, Text } from '@/shared/ui';

import { SideRailItem } from './SideRailItem';
import type { StepProgress } from './useFlowProgress';

type StepsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  steps: StepProgress[];
};

/** Figma M04a «Hoja de pasos»: the sections of the side rail, from the top bar on phones. */
export const StepsSheet = ({ isOpen, onClose, steps }: StepsSheetProps) => (
  <Sheet isOpen={isOpen} onClose={onClose} title='Tu declaración'>
    <nav aria-label='Secciones de la declaración'>
      <ul className='flex flex-col gap-1'>
        {steps.map(step => (
          <li key={step.id} onClick={onClose}>
            <SideRailItem to={step.path} label={step.railLabel} state={step.state} />
          </li>
        ))}
      </ul>
    </nav>
    <Text variant='note' className='text-fg-muted'>
      Tu avance se guarda solo en este navegador.
    </Text>
  </Sheet>
);
