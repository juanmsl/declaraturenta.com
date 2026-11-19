import { useId } from 'react';
import type { ReactNode } from 'react';
import { Modal } from 'polpo/components';

import { Button } from './Button';
import { Text } from './Text';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Primary action. */
  confirmLabel: string;
  onConfirm: () => void;
  /** Secondary action that only closes; omit for a single-action dialog. */
  cancelLabel?: string;
};

/**
 * Centered dialog for short confirmations (Figma "Diálogo"), on Polpo's `Modal` with the project's
 * buttons, because `ConfirmationModal` brings its own button styles. ADR 0027.
 */
export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  cancelLabel,
}: DialogProps) => {
  const titleId = useId();

  return (
    <Modal id={`dialog-${titleId}`} isOpen={isOpen} onClose={onClose} position='center' backdrop='opaque'>
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='flex w-120 flex-col gap-4 rounded-lg bg-surface p-7 shadow-[0_24px_48px_-12px_rgb(23_22_43/0.25)]'
      >
        <Text id={titleId} variant='title-m' as='h2'>
          {title}
        </Text>
        <div className='text-fg-secondary'>{children}</div>
        <div className='flex items-center justify-end gap-3 pt-2'>
          {cancelLabel && (
            <Button variant='ghost' type='button' onClick={onClose}>
              {cancelLabel}
            </Button>
          )}
          <Button type='button' onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
