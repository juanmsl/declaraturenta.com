import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { useLocation } from 'react-router';

import { LANDING_PATH } from '@/app/flow';

import { scrollToSection } from './scroll-to-section';

type SectionLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  /** Id of a section of the landing, without `#`. */
  section: string;
};

/**
 * Link to a section of the landing. On the landing it scrolls smoothly; from another page it loads
 * the landing at that section (ADR 0043).
 */
export const SectionLink = ({ section, onClick, ...props }: SectionLinkProps) => {
  const { pathname } = useLocation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (pathname !== LANDING_PATH || event.defaultPrevented) return;
    event.preventDefault();
    scrollToSection(section);
  };

  return <a href={`${LANDING_PATH}#${section}`} onClick={handleClick} {...props} />;
};
