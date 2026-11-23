import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LuCalendar, LuDownload, LuFileText, LuHouse, LuLandmark } from 'react-icons/lu';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { FORM_210_PATH, findResumeStep } from '@/app/flow';
import laptopBase from '@/assets/illustrations/laptop-base.svg';
import laptopScreen from '@/assets/illustrations/laptop-screen.svg';
import { formatLongDate } from '@/shared/lib/format';
import { Button, Icon, Logo, Text } from '@/shared/ui';

const DOCUMENTS = [
  { icon: LuFileText, label: 'Certificado de ingresos y retenciones' },
  { icon: LuLandmark, label: 'Certificados bancarios a 31 de diciembre' },
  { icon: LuHouse, label: 'Certificado de intereses de vivienda' },
  { icon: LuDownload, label: 'Tu reporte de información exógena' },
];

const COPIED_FEEDBACK_MS = 2000;

/**
 * Screen 10 · Móvil · Usa un computador (Figma 23:3012). Since ADR 0060 the steps work on phones and
 * tablets, so it only shows for the full Formulario 210 below 1280 px, with the copy of M04d and a way
 * back to the steps.
 */
export const UseComputerPage = () => {
  const { taxpayer, completedSteps } = useDeclaration().state;
  const navigate = useNavigate();
  const link = `${window.location.origin}${FORM_210_PATH}`;
  const displayLink = `${window.location.host}${FORM_210_PATH}`;
  const canShare = typeof navigator.share === 'function';
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const id = window.setTimeout(() => {
      setIsCopied(false);
    }, COPIED_FEEDBACK_MS);
    return () => {
      window.clearTimeout(id);
    };
  }, [isCopied]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
  };

  const shareLink = async () => {
    try {
      await navigator.share({
        title: 'Declara tu renta',
        text: 'Abre Declara tu renta en tu computador para seguir con tu declaración.',
        url: link,
      });
    } catch {
      // The user closed the share sheet: nothing to do.
    }
  };

  return (
    <div className='min-h-dvh bg-canvas'>
      <main className='mx-auto flex max-w-120 flex-col gap-7 px-5 pt-6 pb-8'>
        <Logo size={24} wordmarkVariant='title-s' decorative />

        <div aria-hidden className='flex flex-col items-center rounded-lg bg-rail pt-7 pb-6'>
          <img src={laptopScreen} width={236} height={148} alt='' />
          <img src={laptopBase} width={280} height={14} alt='' />
        </div>

        <div className='flex flex-col gap-3'>
          <Text variant='title-l' as='h1'>
            El Formulario 210 se usa en un computador
          </Text>
          <Text variant='body-l' className='text-fg-secondary'>
            La vista del formulario completo, casilla por casilla, necesita una pantalla de al menos 1280 px
            de ancho. Para usarla en un computador, descarga tus datos con «Mis datos» y cárgalos allá. Aquí
            puedes seguir llenando por pasos.
          </Text>
        </div>

        <Text
          variant='figure-m'
          className='truncate rounded-md border border-line bg-surface px-4 py-3.5 text-fg-secondary'
        >
          {displayLink}
        </Text>

        <div className='flex flex-col gap-3'>
          <Button className='w-full' onClick={() => void copyLink()}>
            {isCopied ? 'Enlace copiado' : 'Copiar enlace'}
          </Button>
          <Button
            variant='secondary'
            className='w-full'
            onClick={() => void navigate(findResumeStep(completedSteps).path)}
          >
            Seguir por pasos
          </Button>
          {canShare && (
            <Button variant='secondary' className='w-full' onClick={() => void shareLink()}>
              Compartir a mi computador
            </Button>
          )}
        </div>

        <section className='flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5'>
          <Text variant='title-s' as='h2'>
            Mientras tanto, ten a mano
          </Text>
          <ul className='flex flex-col gap-3.5'>
            {DOCUMENTS.map(item => (
              <li key={item.label} className='flex items-center gap-3'>
                <Icon icon={item.icon} size={18} className='text-fg-action' />
                <Text as='span' variant='body-m' className='text-fg-secondary'>
                  {item.label}
                </Text>
              </li>
            ))}
          </ul>
        </section>

        <div className='flex items-center gap-3 rounded-lg bg-sun-soft p-4'>
          <Icon icon={LuCalendar} size={20} className='text-fg-warning' />
          <div className='flex flex-col gap-0.5'>
            <Text variant='note' className='text-fg-warning'>
              Tu fecha límite
            </Text>
            <Text variant='body-m-strong'>
              {taxpayer.filingDeadline ? formatLongDate(taxpayer.filingDeadline) : 'Aún sin calcular'}
            </Text>
          </div>
        </div>
      </main>
    </div>
  );
};
