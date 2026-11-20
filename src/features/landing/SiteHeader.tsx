import { Link, useNavigate } from 'react-router';

import { HOME_PATH, LANDING_PATH } from '@/app/flow';
import { Button, Logo } from '@/shared/ui';

const LINKS = [
  { href: '#debo-declarar', label: '¿Debo declarar?' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#que-cubre', label: 'Qué cubre' },
  { href: '#preguntas', label: 'Preguntas frecuentes' },
];

/** Landing and legal pages header (Figma 18 «Navegación»). Section links go to the landing. */
export const SiteHeader = () => {
  const navigate = useNavigate();

  return (
    <header className='border-b border-line bg-surface'>
      <div className='mx-auto flex max-w-290 items-center gap-8 px-5 py-3 lg:px-0 lg:py-4'>
        <Link
          to={LANDING_PATH}
          className='rounded-sm focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
        >
          <Logo size={28} wordmarkVariant='title-s' decorative />
        </Link>
        <div className='flex-1' />
        <nav aria-label='Secciones' className='hidden items-center gap-8 lg:flex'>
          {LINKS.map(link => (
            <a
              key={link.href}
              href={`${LANDING_PATH}${link.href}`}
              className='rounded-sm type-body-m-strong text-fg hover:text-fg-action focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button onClick={() => void navigate(HOME_PATH)}>
          <span className='hidden lg:inline'>Preparar mi declaración</span>
          <span className='lg:hidden'>Empezar</span>
        </Button>
      </div>
    </header>
  );
};
