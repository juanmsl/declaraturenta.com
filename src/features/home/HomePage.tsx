import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { FLOW_STEPS } from '@/app/flow';
import { useHelp } from '@/app/help/help-context';
import { Button, Text } from '@/shared/ui';

import { ChecklistCard } from './components/ChecklistCard';
import { DeadlineCard } from './components/DeadlineCard';
import { JourneyList } from './components/JourneyList';

const [firstStep, exogenousStep] = FLOW_STEPS;

/** Screen 01 · Inicio (Figma node 7:2). */
export const HomePage = () => {
  const { taxYear } = useTaxYear();
  const navigate = useNavigate();
  const { state, dispatch } = useDeclaration();
  const { taxpayer } = state;
  const { openHelp } = useHelp();
  const dismissIntro = () => {
    dispatch({ type: 'dismissHelpIntro' });
  };

  return (
    <div className='flex flex-col gap-8 px-14 py-12'>
      <header className='flex flex-col gap-3.5'>
        <Text variant='display' className='max-w-205'>
          Hola, {taxpayer.firstName}. Preparemos tu declaración de renta del año gravable {taxYear.year}.
        </Text>
        <Text variant='body-l' className='max-w-170 text-fg-secondary'>
          Te hacemos preguntas sencillas, prellenamos lo que la DIAN ya sabe de ti y te mostramos de dónde
          sale cada cifra. Al final tendrás tu Formulario 210 listo para revisar.
        </Text>
      </header>

      <div className='flex items-start gap-12'>
        <JourneyList />
        <div className='flex w-100 shrink-0 flex-col gap-5'>
          {!state.helpIntroDismissed && (
            <section
              className='flex flex-col gap-3 rounded-lg bg-rail p-5'
              aria-labelledby='help-intro-title'
            >
              <Text id='help-intro-title' variant='title-s' as='h2'>
                ¿Primera vez aquí?
              </Text>
              <Text variant='body-m' className='text-fg-secondary'>
                Mira en dos minutos cómo funciona la plataforma. La guía y las preguntas frecuentes siempre
                están en «Ayuda», arriba a la derecha.
              </Text>
              <div className='flex items-center gap-2'>
                <Button
                  variant='secondary'
                  onClick={() => {
                    dismissIntro();
                    openHelp('guide');
                  }}
                >
                  Ver la guía
                </Button>
                <Button variant='ghost' onClick={dismissIntro}>
                  Ahora no
                </Button>
              </div>
            </section>
          )}
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
