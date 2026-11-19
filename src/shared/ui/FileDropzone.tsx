import { useId, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { LuFileText, LuUpload } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

type FileDropzoneProps = {
  /** Accepted extensions, e.g. `.xlsx,.pdf`. */
  accept: string;
  /** Maximum size in bytes. */
  maxSize: number;
  /** Human description of the accepted files, e.g. "Excel o PDF, hasta 5 MB". */
  hint: string;
  onFileSelected: (file: File) => void;
  /** When set, shows the selected file instead of the empty drop area. */
  selected?: { name: string; description: string };
};

/**
 * Drag-and-drop or click-to-choose file area (dashed card from Figma screen 03).
 * Local component because Polpo's InputFile has fixed English copy (see ADR 0015).
 */
export const FileDropzone = ({ accept, maxSize, hint, onFileSelected, selected }: FileDropzoneProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    if (!accept.split(',').includes(extension)) {
      setError(`Ese archivo no es compatible. Usa uno de estos formatos: ${accept.replaceAll(',', ', ')}.`);
      return;
    }
    if (file.size > maxSize) {
      setError(
        'El archivo es demasiado grande. Revisa que sea el reporte de exógena que descargaste de la DIAN.',
      );
      return;
    }
    setError(null);
    onFileSelected(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    pickFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files[0]);
  };

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      type='file'
      accept={accept}
      className='sr-only'
      onChange={handleChange}
      aria-describedby={error ? `${inputId}-error` : undefined}
    />
  );

  return (
    <div className='flex flex-col gap-2'>
      {selected ? (
        <div className='flex items-center gap-4 rounded-lg border-[1.5px] border-dashed border-line-strong bg-surface p-5'>
          <span className='flex size-12 shrink-0 items-center justify-center rounded-md bg-mint-soft text-fg-success'>
            <Icon icon={LuFileText} size={22} />
          </span>
          <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <Text variant='body-m-strong' nowrap>
              {selected.name}
            </Text>
            <Text variant='note' className='text-fg-muted'>
              {selected.description}
            </Text>
          </div>
          {input}
          <Button variant='ghost' type='button' onClick={() => inputRef.current?.click()}>
            Cambiar archivo
          </Button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={event => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => {
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer items-center gap-4 rounded-lg border-[1.5px] border-dashed bg-surface p-5 transition-colors duration-150',
            'has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-line-action',
            isDragging ? 'border-line-action bg-rail' : 'border-line-strong hover:border-line-action',
          )}
        >
          <span className='flex size-12 shrink-0 items-center justify-center rounded-md bg-action-soft text-fg-action'>
            <Icon icon={LuUpload} size={22} />
          </span>
          <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <Text as='span' variant='body-m-strong'>
              Arrastra tu archivo aquí o haz clic para elegirlo
            </Text>
            <Text as='span' variant='note' className='text-fg-muted'>
              {hint}
            </Text>
          </span>
          {input}
        </label>
      )}
      {error && (
        <Text id={`${inputId}-error`} variant='note' role='alert' className='text-fg-error'>
          {error}
        </Text>
      )}
    </div>
  );
};
