import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { PRIVACY_PATH, TERMS_PATH } from '@/app/flow';
import { Logo, Text } from '@/shared/ui';

import { SectionLink } from './SectionLink';

export const CONTACT_EMAIL = 'juanmsl.pk@gmail.com';

const linkClass =
  'rounded-sm type-body-m text-white/90 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none';

const Column = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className='flex flex-col gap-3'>
    <Text variant='caption' className='text-white/60'>
      {title}
    </Text>
    {children}
  </div>
);

/** Dark footer of the landing and legal pages (Figma 18 «Pie de página»). */
export const SiteFooter = () => (
  <footer className='bg-ink text-white'>
    <div className='mx-auto flex max-w-290 flex-col gap-10 px-5 py-14 lg:px-0 lg:py-16'>
      <div className='flex flex-col gap-8 lg:flex-row lg:gap-16'>
        <div className='flex flex-1 flex-col gap-4'>
          <Logo color='inverted' size={32} decorative />
          <Text variant='body-m' className='max-w-90 text-white/75'>
            Prepara tu Formulario 210 con preguntas sencillas y entiende de dónde sale cada cifra.
          </Text>
        </div>
        <Column title='Producto'>
          <SectionLink section='como-funciona' className={linkClass}>
            Cómo funciona
          </SectionLink>
          <SectionLink section='que-cubre' className={linkClass}>
            Qué cubre
          </SectionLink>
          <SectionLink section='preguntas' className={linkClass}>
            Preguntas frecuentes
          </SectionLink>
        </Column>
        <Column title='Legal'>
          <Link to={TERMS_PATH} className={linkClass}>
            Términos de uso
          </Link>
          <Link to={PRIVACY_PATH} className={linkClass}>
            Política de privacidad
          </Link>
        </Column>
        <Column title='Contacto'>
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>
        </Column>
      </div>
      <div className='border-t border-white/15 pt-6'>
        <Text variant='note' className='text-white/60'>
          © 2026 Declara tu renta. No somos la DIAN ni tenemos relación con ella. La plataforma te ayuda a
          preparar tu declaración y no reemplaza la asesoría de un contador.
        </Text>
      </div>
    </div>
  </footer>
);
