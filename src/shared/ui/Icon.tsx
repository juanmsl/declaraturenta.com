import type { IconType } from 'react-icons';
import { cn } from 'polpo/helpers';

type IconProps = {
  icon: IconType;
  /** Rendered size in px. Figma icons use 14, 16 or 18. */
  size?: number;
  className?: string;
  /** Accessible label. Without it the icon is decorative and hidden from assistive tech. */
  label?: string;
};

/** Lucide strokes are drawn on a 24px grid; Figma keeps a 2px stroke at every size. */
const FIGMA_STROKE_PX = 2;

export const Icon = ({ icon: IconComponent, size = 18, className, label }: IconProps) => (
  <IconComponent
    size={size}
    strokeWidth={(FIGMA_STROKE_PX * 24) / size}
    className={cn('shrink-0', className)}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    role={label ? 'img' : undefined}
  />
);
