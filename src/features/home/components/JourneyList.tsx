import { FLOW_STEPS } from '@/app/flow';
import { Diamond, Text } from '@/shared/ui';

/** "Tu camino": the seven sections with a summary and estimated time. The first one is next. */
export const JourneyList = () => (
  <section aria-labelledby='journey-title' className='flex min-w-0 flex-1 flex-col'>
    <Text id='journey-title' variant='title-m' as='h2'>
      Tu camino
    </Text>
    <ol className='flex flex-col pt-3'>
      {FLOW_STEPS.map((step, index) => (
        <li key={step.id} className='flex items-center gap-4 border-b border-line py-3.5 last:border-b-0'>
          <Diamond state={index === 0 ? 'current' : 'pending'} />
          <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <Text variant='body-m-strong'>{step.title}</Text>
            <Text variant='note' className='text-fg-muted'>
              {step.summary}
            </Text>
          </div>
          <Text variant='note' className='shrink-0 text-fg-muted'>
            {step.minutes} min
          </Text>
        </li>
      ))}
    </ol>
  </section>
);
