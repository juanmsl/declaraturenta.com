import type { ComponentProps } from 'react';
import type { IconType } from 'react-icons';
import { Button as PolpoButton } from 'polpo/components';
import { cn } from 'polpo/helpers';

import { Icon } from './Icon';

/** Figma "Botón" styles: Primario, Secundario, Fantasma. Use one primary action per screen. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const POLPO_VARIANT = {
  primary: 'solid',
  secondary: 'outlined',
  ghost: 'text',
} as const satisfies Record<ButtonVariant, ComponentProps<typeof PolpoButton>['variant']>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-action text-fg-on-action hover:bg-action-hover active:bg-action-hover focus-visible:bg-action-hover disabled:bg-subtle disabled:text-fg-muted',
  secondary:
    'border-line-strong bg-surface text-fg hover:bg-subtle active:bg-subtle focus-visible:bg-subtle disabled:border-line disabled:bg-surface disabled:text-fg-muted',
  ghost:
    'text-fg-action hover:bg-action-soft active:bg-action-soft focus-visible:bg-action-soft disabled:text-fg-muted',
};

export type ButtonProps = Omit<
  ComponentProps<typeof PolpoButton>,
  'variant' | 'color' | 'size' | 'radius'
> & {
  variant?: ButtonVariant;
  /** Icon shown after the label (Figma places it on the right). */
  icon?: IconType;
};

/** Polpo `Button` styled with the Figma button component. */
export const Button = ({ variant = 'primary', icon, children, className, ...props }: ButtonProps) => (
  <PolpoButton
    {...props}
    variant={POLPO_VARIANT[variant]}
    className={cn(
      'gap-2 rounded-md px-5 py-3 type-body-m-strong',
      'shadow-none hover:shadow-none active:shadow-none',
      '[--shadow-color:color-mix(in_srgb,var(--color-action)_25%,transparent)]',
      VARIANT_CLASSES[variant],
      className,
    )}
  >
    {children}
    {icon && <Icon icon={icon} size={18} />}
  </PolpoButton>
);
