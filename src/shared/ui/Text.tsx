import type { ComponentProps, ElementType } from 'react';
import { cn } from 'polpo/helpers';
import { Typography } from 'polpo/components';

/**
 * The 12 text styles defined in Figma ("Fundamentos"), named in English.
 * Display/Titles use Bricolage Grotesque; everything else uses Figtree.
 * Each variant maps to a `type-<variant>` utility defined in src/styles/index.css.
 */
export type TextVariant =
  | 'display'
  | 'title-l'
  | 'title-m'
  | 'title-s'
  | 'body-l'
  | 'body-m'
  | 'body-m-strong'
  | 'caption'
  | 'note'
  | 'figure-hero'
  | 'figure-xl'
  | 'figure-l'
  | 'figure-m';

type PolpoVariant = NonNullable<ComponentProps<typeof Typography>['variant']>;

/**
 * Semantic Polpo variant (sets the default HTML element) and the `type-*` utility for each
 * Figma style. Class names must stay literal so Tailwind can detect them.
 */
const VARIANTS: Record<TextVariant, { polpo: PolpoVariant; className: string }> = {
  display: { polpo: 'header1', className: 'type-display' },
  'title-l': { polpo: 'header2', className: 'type-title-l' },
  'title-m': { polpo: 'header3', className: 'type-title-m' },
  'title-s': { polpo: 'header4', className: 'type-title-s' },
  'body-l': { polpo: 'body', className: 'type-body-l' },
  'body-m': { polpo: 'body', className: 'type-body-m' },
  'body-m-strong': { polpo: 'body', className: 'type-body-m-strong' },
  caption: { polpo: 'label', className: 'type-caption' },
  note: { polpo: 'small', className: 'type-note' },
  'figure-hero': { polpo: 'label', className: 'type-figure-hero' },
  'figure-xl': { polpo: 'label', className: 'type-figure-xl' },
  'figure-l': { polpo: 'label', className: 'type-figure-l' },
  'figure-m': { polpo: 'label', className: 'type-figure-m' },
};

export type TextProps = Omit<ComponentProps<typeof Typography>, 'variant' | 'noPadding' | 'weight'> & {
  variant?: TextVariant;
  as?: ElementType;
};

/**
 * Project text component: Polpo `Typography` with the exact Figma text styles.
 * Pass `as` to change the rendered element without changing the style.
 */
export const Text = ({ variant = 'body-m', className, ...props }: TextProps) => {
  return (
    <Typography
      {...props}
      variant={VARIANTS[variant].polpo}
      noPadding
      className={cn('m-0', VARIANTS[variant].className, className)}
    />
  );
};
