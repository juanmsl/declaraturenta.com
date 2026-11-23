import { useNavigate } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { getStep } from '@/app/flow';
import { useHelp } from '@/app/help/help-context';
import { useIsCompact } from '@/shared/lib/use-compact';
import { Button, Text } from '@/shared/ui';

import { ChecklistCard } from './components/ChecklistCard';
import { DeadlineCard } from './components/DeadlineCard';
import { JourneyList } from './components/JourneyList';

const firstStep = getStep('exogenous');

/** Screen 01 · Inicio (Figma node 7:2; phones and tablets M01, ADR 0060). */
export const HomePage = () => {
  const { taxYear } = useTaxYear();
  const navigate = useNavigate();
  const { state, dispatch } = useDeclaration();
  const { taxpayer } = state;
  const { openHelp } = useHelp();
  const isCompact = useIsCompact();
  const dismissIntro = () => {
    dispatch({ type: 'dismissHelpIntro' });
  };

  const header = (
    <header className='flex flex-col gap-3.5'>
      <Text variant={isCompact ? 'title-l' : 'display'} className='max-w-205'>
        {taxpayer.firstName ? `Hola, ${taxpayer.firstName}. ` : ''}Preparemos tu declaración de renta del año
        gravable {taxYear.year}.
      </Text>
      <Text variant={isCompact ? 'body-m' : 'body-l'} className='max-w-170 text-fg-secondary'>
        {state.exogenous.fileName
          ? 'Te hacemos preguntas sencillas, prellenamos lo que la DIAN ya sabe de ti y te mostramos de dónde sale cada cifra. Al final tendrás tu Formulario 210 listo para revisar.'
          : 'Empieza por tu información exógena: la descargas del portal de la DIAN y llevamos cada dato a su casilla. Si no la tienes, puedes llenar todo a mano.'}
      </Text>
    </header>
  );

  const helpIntro = !state.helpIntroDismissed && (
    <section className='flex flex-col gap-3 rounded-lg bg-rail p-5' aria-labelledby='help-intro-title'>
      <Text id='help-intro-title' variant='title-s' as='h2'>
        ¿Primera vez aquí?
      </Text>
      <Text variant='body-m' className='text-fg-secondary'>
        Mira en dos minutos cómo funciona la plataforma. La guía y las preguntas frecuentes siempre están en
        «Ayuda», {isCompact ? 'dentro del menú (≡)' : 'arriba a la derecha'}.
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
  );

  const start = (
    <Button
      icon={LuArrowRight}
      className={isCompact ? 'w-full' : undefined}
      onClick={() => void navigate(firstStep.path)}
    >
      Subir mi exógena
    </Button>
  );

  // Figma M01: one column, in reading order.
  if (isCompact) {
    return (
      <div className='mx-auto flex w-full max-w-180 flex-col gap-6 px-4 pt-4 pb-8 md:px-8 md:pt-8'>
        {header}
        {helpIntro}
        <DeadlineCard />
        <JourneyList />
        <ChecklistCard />
        {start}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8 px-14 py-12'>
      {/* Figma 01: the title goes in the left column, so the cards on the right start at the top. */}
      <div className='flex items-start gap-12'>
        <div className='flex min-w-0 flex-1 flex-col gap-8'>
          {header}
          <JourneyList />
        </div>
        <div className='flex w-100 shrink-0 flex-col gap-5'>
          {helpIntro}
          <DeadlineCard />
          <ChecklistCard />
        </div>
      </div>

      <div className='flex items-start gap-3'>{start}</div>
    </div>
  );
};
