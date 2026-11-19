import { useState } from 'react';
import { LuChevronLeft } from 'react-icons/lu';
import { Accordion, AccordionItem, Tabs } from 'polpo/components';

import type { HelpTab } from '@/app/help/help-context';
import { Button, Drawer, NoteBox, Text, TextField } from '@/shared/ui';

import { FAQ_ITEMS, GUIDE_STEPS, GUIDE_TIPS, searchFaq } from './help-content';
import type { FaqCategory } from './help-content';

const CATEGORIES: readonly FaqCategory[] = ['La plataforma', 'Tus datos', 'Conceptos'];

type HelpDrawerProps = {
  /** Open tab; null when closed. */
  tab: HelpTab | null;
  onClose: () => void;
};

/** "Ayuda": a side panel with the guide and the searchable frequent questions (ADR 0028). */
export const HelpDrawer = ({ tab, onClose }: HelpDrawerProps) => (
  <Drawer
    isOpen={tab !== null}
    onClose={onClose}
    title='Ayuda'
    subtitle='Cómo funciona Declara tu renta y qué significa cada concepto'
    footer={
      <Button variant='ghost' onClick={onClose}>
        Cerrar
      </Button>
    }
  >
    {tab && (
      <Tabs key={tab} defaultOpenTab={tab}>
        <Tabs.TabList variant='line' className='help-tabs mb-5'>
          <Tabs.Tab id='guide'>Guía</Tabs.Tab>
          <Tabs.Tab id='faq'>Preguntas frecuentes</Tabs.Tab>
        </Tabs.TabList>
        <Tabs.TabPanel id='guide'>
          <Guide />
        </Tabs.TabPanel>
        <Tabs.TabPanel id='faq'>
          <Faq />
        </Tabs.TabPanel>
      </Tabs>
    )}
  </Drawer>
);

const Guide = () => (
  <div className='flex flex-col gap-5'>
    <Text variant='body-m' className='text-fg-secondary'>
      Son siete pasos. Puedes ir y volver cuando quieras; lo que respondes se guarda solo.
    </Text>
    <ol className='flex flex-col gap-3.5'>
      {GUIDE_STEPS.map((step, index) => (
        <li key={step.title} className='flex items-start gap-3'>
          <Text
            as='span'
            variant='caption'
            className='flex size-6 shrink-0 items-center justify-center rounded-md bg-action-soft text-fg-action'
          >
            {index + 1}
          </Text>
          <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <Text variant='body-m-strong'>{step.title}</Text>
            <Text variant='body-m' className='text-fg-secondary'>
              {step.text}
            </Text>
          </div>
        </li>
      ))}
    </ol>
    <NoteBox>
      <span className='flex flex-col gap-1.5'>
        {GUIDE_TIPS.map(tip => (
          <span key={tip}>{tip}</span>
        ))}
      </span>
    </NoteBox>
    <Text variant='note' className='text-fg-muted'>
      Es una guía general para el año gravable 2025. Si tu caso es especial, consulta con un contador.
    </Text>
  </div>
);

const Faq = () => {
  const [query, setQuery] = useState('');
  const results = searchFaq(query, FAQ_ITEMS);

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <TextField
          name='faq-search'
          label='Busca por concepto'
          value={query}
          onChange={setQuery}
          placeholder='Ej.: retención, dependientes, casilla 92'
        />
      </div>
      {results.length === 0 ? (
        <Text variant='body-m' className='text-fg-secondary' role='status'>
          No encontramos preguntas sobre «{query}». Prueba con otra palabra, como «exógena» o «tope».
        </Text>
      ) : (
        CATEGORIES.map(category => {
          const items = results.filter(item => item.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} className='flex flex-col gap-2'>
              <Text variant='caption' as='h3' className='text-fg-muted'>
                {category}
              </Text>
              <Accordion className='faq rounded-lg border border-line bg-surface px-4' multiple>
                {items.map(item => (
                  <AccordionItem key={item.id} title={item.question} icon={LuChevronLeft}>
                    <Text variant='body-m' className='pb-3 text-fg-secondary'>
                      {item.answer}
                    </Text>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          );
        })
      )}
    </div>
  );
};
