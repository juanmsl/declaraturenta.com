import { useEffect } from 'react';

import { PUBLIC_PAGES } from '@/app/seo/pages';
import { usePageMeta } from '@/app/seo/use-page-meta';
import { SiteFooter } from '@/features/landing/SiteFooter';
import { SiteHeader } from '@/features/landing/SiteHeader';
import { formatLongDate } from '@/shared/lib/format';
import { Text } from '@/shared/ui';

import { LEGAL_UPDATED_AT, PRIVACY, TERMS } from './legal-content';
import type { LegalSection } from './legal-content';

const PAGES = {
  terms: { title: 'Términos de uso', sections: TERMS },
  privacy: { title: 'Política de privacidad', sections: PRIVACY },
} as const satisfies Record<string, { title: string; sections: readonly LegalSection[] }>;

/** Screens 16b · Términos de uso and 16c · Política de privacidad (Figma 95:9998 and 95:10053). */
export const LegalPage = ({ page }: { page: keyof typeof PAGES }) => {
  const { title, sections } = PAGES[page];

  usePageMeta(PUBLIC_PAGES[page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className='min-h-dvh bg-surface'>
      <SiteHeader />
      <main className='px-5 py-14 lg:px-0 lg:py-20'>
        <article className='mx-auto flex max-w-180 flex-col gap-8'>
          <header className='flex flex-col gap-2'>
            <Text variant='display'>{title}</Text>
            <Text variant='note' className='text-fg-muted'>
              Última actualización: {formatLongDate(LEGAL_UPDATED_AT)}
            </Text>
          </header>
          {sections.map(section => (
            <section key={section.title} className='flex flex-col gap-2'>
              <Text variant='title-m' as='h2'>
                {section.title}
              </Text>
              <Text variant='body-l' className='text-fg-secondary'>
                {section.text}
              </Text>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
};
