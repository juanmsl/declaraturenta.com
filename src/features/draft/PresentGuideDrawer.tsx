import { useDeclaration } from '@/app/declaration/declaration-context';
import { useTaxYear } from '@/app/declaration/tax-year-context';
import { formatLongDate } from '@/shared/lib/format';
import { Button, Drawer, NoteBox, Text } from '@/shared/ui';

type PresentGuideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
};

/** "Cómo presentarlo en la DIAN": general steps to file (not designed in Figma; ADR 0019). */
export const PresentGuideDrawer = ({
  isOpen,
  onClose,
  onDownload,
  isDownloading,
}: PresentGuideDrawerProps) => {
  const { taxYear } = useTaxYear();
  const { state, result } = useDeclaration();
  const toPay = result.amountToPay > 0;
  const wantsRefund = result.amountInFavor > 0 && state.data.refundPreference === 'refund';

  const steps = [
    'Ingresa al portal de la DIAN con tu usuario y contraseña.',
    `Abre el diligenciamiento del Formulario 210 del año gravable ${taxYear.year}.`,
    'Pasa las cifras de este borrador casilla por casilla. Con «Ver formato 210» las ubicas fácil.',
    state.taxpayer.filingDeadline
      ? `Revisa, firma con tu firma electrónica y presenta antes de tu fecha límite: ${formatLongDate(state.taxpayer.filingDeadline)}.`
      : 'Revisa, firma con tu firma electrónica y presenta antes de tu fecha límite, que depende de los dos últimos dígitos de tu NIT.',
    ...(toPay ? ['Paga el saldo en línea o en un banco con el recibo de pago que genera el portal.'] : []),
    ...(wantsRefund
      ? ['Después de presentar, solicita en el portal la devolución de tu saldo a favor.']
      : []),
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title='Cómo presentarlo en la DIAN'
      subtitle='Pasos generales; el portal de la DIAN puede cambiar'
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            Cerrar
          </Button>
          <Button variant='secondary' onClick={onDownload} isLoading={isDownloading}>
            Descargar PDF
          </Button>
        </>
      }
    >
      <ol className='flex flex-col gap-3.5'>
        {steps.map((step, index) => (
          <li key={step} className='flex items-start gap-3'>
            <Text
              as='span'
              variant='caption'
              className='flex size-6 shrink-0 items-center justify-center rounded-md bg-action-soft text-fg-action'
            >
              {index + 1}
            </Text>
            <Text variant='body-m' className='flex-1 text-fg-secondary'>
              {step}
            </Text>
          </li>
        ))}
      </ol>
      <NoteBox>
        Necesitas tu firma electrónica activa. Si no la tienes, tramítala en el portal de la DIAN con tiempo,
        antes de tu fecha límite.
      </NoteBox>
    </Drawer>
  );
};
