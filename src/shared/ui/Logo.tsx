import { cn } from 'polpo/helpers';

import isotypeColor from '@/assets/brand/isotype-color.svg';
import isotypeInk from '@/assets/brand/isotype-ink.svg';
import isotypeInverted from '@/assets/brand/isotype-inverted.svg';

import { Text } from './Text';
import type { TextVariant } from './Text';

type LogoColor = 'color' | 'ink' | 'inverted';

const ISOTYPES: Record<LogoColor, string> = {
  color: isotypeColor,
  ink: isotypeInk,
  inverted: isotypeInverted,
};

type LogoProps = {
  /** Hide the isotype from assistive tech when the name is already written next to it. */
  decorative?: boolean;
  /** Figma "Versión": horizontal (isotype + wordmark) or isotype only. */
  version?: 'horizontal' | 'isotype';
  /** Figma "Color": color on light backgrounds, ink for one-colour print, inverted on bg-ink. */
  color?: LogoColor;
  /** Isotype size in px (minimum 16). */
  size?: number;
  /** Text style of the wordmark; small headers (screen 10) use `title-s`. */
  wordmarkVariant?: Extract<TextVariant, 'title-l' | 'title-s'>;
  className?: string;
};

/** "Declara tu renta" logo (Figma component Logo 33:3139). */
export const Logo = ({
  version = 'horizontal',
  color = 'color',
  size = 48,
  decorative = false,
  wordmarkVariant = 'title-l',
  className,
}: LogoProps) => {
  const isotype = (
    <img
      src={ISOTYPES[color]}
      width={size}
      height={size}
      alt={version === 'isotype' && !decorative ? 'Declara tu renta' : ''}
      className='shrink-0'
    />
  );

  if (version === 'isotype') return isotype;

  return (
    <div className={cn('flex items-center', wordmarkVariant === 'title-s' ? 'gap-2' : 'gap-3.5', className)}>
      {isotype}
      <Text variant={wordmarkVariant} as='span' className={color === 'inverted' ? 'text-white' : 'text-fg'}>
        Declara tu renta
      </Text>
    </div>
  );
};
