import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';

import { FLOW_STEPS } from '@/app/flow';
import { TAX_YEAR } from '@/domain/uvt';
import { sampleTaxpayer } from '@/mocks/sample-taxpayer';
import { Button, Text } from '@/shared/ui';

import { ChecklistCard } from './components/ChecklistCard';
import { DeadlineCard } from './components/DeadlineCard';
import { JourneyList } from './components/JourneyList';

const [firstStep, exogenousStep] = FLOW_STEPS;

/** Screen 01 · Inicio (Figma node 7:2). */
export const HomePage = () => {
  const navigate = useNavigate();
  const taxpayer = sampleTaxpayer;

  return (
    <div className='flex flex-col gap-8 px-14 py-12'>
      <header className='flex flex-col gap-3.5'>
        <Text variant='display' className='max-w-205'>
          Hola, {taxpayer.firstName}. Preparemos tu declaración de renta del año gravable {TAX_YEAR}.
        </Text>
        <Text variant='body-l' className='max-w-170 text-fg-secondary'>
          Te hacemos preguntas sencillas, prellenamos lo que la DIAN ya sabe de ti y te mostramos de dónde
          sale cada cifra. Al final tendrás tu Formulario 210 listo para revisar.
        </Text>
      </header>

      <div className='flex items-start gap-12'>
        <JourneyList />
        <div className='flex w-100 shrink-0 flex-col gap-5'>
          <DeadlineCard taxpayer={taxpayer} />
          <ChecklistCard />
        </div>
      </div>

      <div className='flex items-start gap-3'>
        <Button icon={LuArrowRight} onClick={() => void navigate(firstStep.path)}>
          Empezar por {firstStep.title}
        </Button>
        <Button variant='secondary' onClick={() => void navigate(exogenousStep.path)}>
          Ya tengo mi exógena
        </Button>
      </div>
    </div>
  );
};
