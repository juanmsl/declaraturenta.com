import { useNavigate } from 'react-router';
import { LuArrowRight, LuChevronLeft } from 'react-icons/lu';
import { Accordion, AccordionItem } from 'polpo/components';

import { HOME_PATH } from '@/app/flow';
import { PUBLIC_PAGES } from '@/app/seo/pages';
import { usePageMeta } from '@/app/seo/use-page-meta';
import { DEFAULT_TAX_YEAR } from '@/domain/tax-years';
import { Button, CalcRow, Chip, Icon, RevealSection, revealItem, Text } from '@/shared/ui';

import { FilingCalculator } from './FilingCalculator';
import { COVERAGE, DATA_POINTS, HOW_STEPS, LANDING_FAQ } from './landing-content';
import { ProductPreview } from './ProductPreview';
import { scrollToSection } from './scroll-to-section';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

const SECTION = 'scroll-mt-4 px-5 py-14 lg:px-0 lg:py-24';
const INNER = 'mx-auto flex max-w-290 flex-col';

/** Screen 18 · Landing (Figma 93:9426, mobile 109:11753): the first route of the app (ADR 0036). */
export const LandingPage = () => {
  usePageMeta(PUBLIC_PAGES.landing);
  const navigate = useNavigate();
  const start = () => void navigate(HOME_PATH);

  return (
    <div className='min-h-dvh bg-surface'>
      <SiteHeader />
      <main>
        {/* Hero */}
        <RevealSection className='bg-rail px-5 py-14 lg:px-0 lg:py-20'>
          <div className={`${INNER} items-center gap-12 lg:flex-row lg:justify-between`}>
            <div className='flex flex-col gap-6 lg:w-116'>
              <Text
                {...revealItem(0)}
                variant='caption'
                className='reveal-item self-start rounded-full bg-action-soft px-3 py-1 text-fg-action'
              >
                Formulario 210 · año gravable {DEFAULT_TAX_YEAR}
              </Text>
              <Text {...revealItem(1)} variant='display-xl' className='reveal-item max-lg:type-display'>
                Tu declaración de renta, explicada casilla por casilla.
              </Text>
              <Text {...revealItem(2)} variant='body-l' className='reveal-item text-fg-secondary'>
                Respondes preguntas sencillas, prellenamos con tu información exógena y te mostramos de dónde
                sale cada cifra. Al final tienes tu Formulario 210 listo para pasarlo al portal de la DIAN.
              </Text>
              <div {...revealItem(3)} className='reveal-item flex flex-col gap-3 lg:flex-row'>
                <Button icon={LuArrowRight} onClick={start}>
                  Preparar mi declaración
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    scrollToSection('como-funciona');
                  }}
                >
                  Ver cómo funciona
                </Button>
              </div>
              <Text {...revealItem(4)} variant='note' className='reveal-item text-fg-muted'>
                Sin crear cuenta. Tus datos se quedan en tu navegador.
              </Text>
            </div>
            <div {...revealItem(3)} className='reveal-item hidden lg:block'>
              <ProductPreview />
            </div>
          </div>
        </RevealSection>

        <FilingCalculator />

        {/* Cómo funciona */}
        <RevealSection id='como-funciona' aria-labelledby='how-title' className={`${SECTION} bg-surface`}>
          <div className={`${INNER} gap-12`}>
            <div {...revealItem(0)} className='reveal-item flex flex-col gap-3'>
              <Text id='how-title' variant='title-l' as='h2'>
                Cómo funciona
              </Text>
              <Text variant='body-l' className='text-fg-secondary'>
                Cuatro pasos, en el orden en que la DIAN pide la información.
              </Text>
            </div>
            <ol className='grid gap-4 lg:grid-cols-4 lg:gap-6'>
              {HOW_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  {...revealItem(index + 1)}
                  className='reveal-item flex flex-col gap-3 rounded-lg bg-canvas p-6'
                >
                  <span className='flex size-8 items-center justify-center rounded-sm bg-action-soft type-caption text-fg-action'>
                    {index + 1}
                  </span>
                  <Text variant='title-m' as='h3'>
                    {step.title}
                  </Text>
                  <Text variant='body-m' className='text-fg-secondary'>
                    {step.text}
                  </Text>
                </li>
              ))}
            </ol>
          </div>
        </RevealSection>

        {/* Qué cubre */}
        <RevealSection id='que-cubre' aria-labelledby='coverage-title' className={`${SECTION} bg-canvas`}>
          <div className={`${INNER} gap-12`}>
            <div {...revealItem(0)} className='reveal-item flex flex-col gap-3'>
              <Text id='coverage-title' variant='title-l' as='h2'>
                Todo tu Formulario 210, cédula por cédula
              </Text>
              <Text variant='body-l' className='text-fg-secondary'>
                Calculamos cada casilla con las reglas del instructivo de la DIAN y te decimos cuándo un tope
                te limita.
              </Text>
            </div>
            <ul className='grid gap-4 lg:grid-cols-3 lg:gap-6'>
              {COVERAGE.map((item, index) => (
                <li
                  key={item.title}
                  {...revealItem(index + 1)}
                  className='reveal-item flex flex-col gap-3 rounded-lg border border-line bg-surface p-6'
                >
                  <Icon icon={item.icon} size={22} className='text-fg-action' />
                  <Text variant='title-s' as='h3'>
                    {item.title}
                  </Text>
                  <Text variant='body-m' className='text-fg-secondary'>
                    {item.text}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </RevealSection>

        {/* Cada cifra con su porqué */}
        <RevealSection aria-labelledby='figures-title' className={`${SECTION} bg-surface`}>
          <div className={`${INNER} gap-10 lg:flex-row lg:items-center lg:gap-16`}>
            <div {...revealItem(0)} className='reveal-item flex flex-1 flex-col gap-4'>
              <Text id='figures-title' variant='title-l' as='h2'>
                Cada cifra con su porqué
              </Text>
              <Text variant='body-l' className='text-fg-secondary'>
                No es una caja negra. Cada valor muestra su casilla, de dónde sale y qué tope se aplicó. Si
                algo no cuadra con tus certificados, lo corriges ahí mismo.
              </Text>
              <div className='flex flex-wrap gap-2'>
                <Chip variant='exogenous'>Desde exógena</Chip>
                <Chip variant='box'>Casilla 92</Chip>
                <Chip variant='cap'>Tope del 40 %</Chip>
              </div>
            </div>
            <div
              {...revealItem(1)}
              className='reveal-item flex flex-col gap-1 rounded-lg bg-canvas p-6 lg:w-130'
            >
              <Text variant='title-s' as='h3'>
                ¿De dónde sale tu renta líquida gravable?
              </Text>
              <CalcRow label='Ingresos brutos' value={180_000_000} />
              <CalcRow label='No constitutivos y costos' value={16_200_000} variant='subtract' />
              <CalcRow label='Renta líquida' value={163_800_000} variant='subtotal' />
              <CalcRow label='Deducciones y exentas' value={69_105_528} variant='subtract' />
              <CalcRow label='Renta líquida gravable' value={94_694_472} variant='total' />
              <Text variant='note' className='text-fg-muted'>
                Datos de ejemplo de una contribuyente ficticia.
              </Text>
            </div>
          </div>
        </RevealSection>

        {/* Tus datos */}
        <RevealSection aria-labelledby='data-title' className={`${SECTION} bg-rail`}>
          <div className={`${INNER} gap-10`}>
            <Text {...revealItem(0)} id='data-title' variant='title-l' as='h2' className='reveal-item'>
              Tus datos no salen de tu navegador
            </Text>
            <ul className='grid gap-6 lg:grid-cols-3 lg:gap-12'>
              {DATA_POINTS.map((point, index) => (
                <li key={point.title} {...revealItem(index + 1)} className='reveal-item flex flex-col gap-2'>
                  <Icon icon={point.icon} size={22} className='text-fg-success' />
                  <Text variant='title-s' as='h3'>
                    {point.title}
                  </Text>
                  <Text variant='body-m' className='text-fg-secondary'>
                    {point.text}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </RevealSection>

        {/* Preguntas frecuentes */}
        <RevealSection id='preguntas' aria-labelledby='faq-title' className={`${SECTION} bg-canvas`}>
          <div className={`${INNER} gap-10`}>
            <Text {...revealItem(0)} id='faq-title' variant='title-l' as='h2' className='reveal-item'>
              Preguntas frecuentes
            </Text>
            <div {...revealItem(1)} className='reveal-item'>
              <Accordion className='faq rounded-lg border border-line bg-surface px-6'>
                {LANDING_FAQ.map(item => (
                  <AccordionItem key={item.question} title={item.question} icon={LuChevronLeft}>
                    <Text variant='body-m' className='pb-3 text-fg-secondary'>
                      {item.answer}
                    </Text>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </RevealSection>

        {/* Llamado final */}
        <RevealSection className='bg-action-soft px-5 py-16 lg:px-0 lg:py-20'>
          <div className={`${INNER} items-center gap-6 text-center`}>
            <Text {...revealItem(0)} variant='title-l' as='h2' className='reveal-item'>
              Prepara tu declaración del año gravable {DEFAULT_TAX_YEAR}
            </Text>
            <Text {...revealItem(1)} variant='body-l' className='reveal-item text-fg-secondary'>
              Sube tu exógena o llena tus datos a mano. Todo se queda en tu navegador.
            </Text>
            <Button
              {...revealItem(2)}
              icon={LuArrowRight}
              className='reveal-item self-stretch lg:self-center'
              onClick={start}
            >
              Preparar mi declaración
            </Button>
          </div>
        </RevealSection>
      </main>
      <SiteFooter />
    </div>
  );
};
