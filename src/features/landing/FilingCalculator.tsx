import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LuArrowRight, LuCheck } from 'react-icons/lu';

import { HOME_PATH } from '@/app/flow';
import { quickFilingCheck } from '@/domain/filing-obligation';
import type { QuickFilingAnswers } from '@/domain/filing-obligation';
import { DEFAULT_TAX_YEAR, getTaxYear, uvtToPesos } from '@/domain/tax-years';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { Alert, Button, Icon, MoneyField, RevealSection, revealItem, Text, ToggleField } from '@/shared/ui';

type YesNoKey = Exclude<keyof QuickFilingAnswers, 'monthlySalary'>;

const INITIAL: QuickFilingAnswers = {
  monthlySalary: 0,
  assetsAbove: false,
  creditCardAbove: false,
  purchasesAbove: false,
  depositsAbove: false,
  vatResponsible: false,
};

/**
 * «¿Tienes que declarar renta este año?» (Figma 18, node 109:11672): a quick, approximate check that
 * lives on the landing. Nothing is saved (ADR 0035).
 */
export const FilingCalculator = () => {
  const navigate = useNavigate();
  const year = getTaxYear(DEFAULT_TAX_YEAR);
  const [answers, setAnswers] = useState(INITIAL);
  const check = quickFilingCheck(answers, year);
  const pesos = (uvt: number) => formatCurrency(uvtToPesos(uvt, year));
  const incomeLimit = pesos(year.filingTestsUvt.grossIncome);

  const questions: { key: YesNoKey; label: string; description: string }[] = [
    {
      key: 'assetsAbove',
      label: `¿Tu patrimonio pasaba de ${pesos(year.filingTestsUvt.grossAssets)}?`,
      description: `Lo que tenías al 31 de diciembre: vivienda, carro, cuentas e inversiones. Tope: ${formatNumber(year.filingTestsUvt.grossAssets)} UVT.`,
    },
    {
      key: 'creditCardAbove',
      label: `¿Compraste con tarjeta de crédito más de ${pesos(year.filingTestsUvt.creditCardPurchases)}?`,
      description: `La suma de todo el año. Tope: ${formatNumber(year.filingTestsUvt.creditCardPurchases)} UVT.`,
    },
    {
      key: 'purchasesAbove',
      label: `¿Tus compras y consumos pasaron de ${pesos(year.filingTestsUvt.totalPurchases)}?`,
      description: `Todo lo que gastaste en el año, con o sin tarjeta. Tope: ${formatNumber(year.filingTestsUvt.totalPurchases)} UVT.`,
    },
    {
      key: 'depositsAbove',
      label: `¿Tus consignaciones, depósitos e inversiones pasaron de ${pesos(year.filingTestsUvt.deposits)}?`,
      description: `Lo que entró a tus cuentas o invertiste durante el año. Tope: ${formatNumber(year.filingTestsUvt.deposits)} UVT.`,
    },
    {
      key: 'vatResponsible',
      label: '¿Eras responsable de IVA?',
      description:
        'Si cobrabas IVA en lo que vendías o en tus servicios, declaras aunque no pases ningún tope.',
    },
  ];

  const salary = formatCurrency(answers.monthlySalary);
  const annual = formatCurrency(check.annualIncome);
  const answered = answers.monthlySalary > 0 || check.otherReasons > 0;

  return (
    <RevealSection
      id='debo-declarar'
      aria-labelledby='calculator-title'
      className='scroll-mt-4 bg-canvas px-5 py-14 lg:px-0 lg:py-24'
    >
      <div className='mx-auto flex max-w-290 flex-col gap-8 lg:flex-row lg:items-start lg:gap-16'>
        <div {...revealItem(0)} className='reveal-item flex flex-col gap-4 lg:w-120 lg:shrink-0'>
          <Text id='calculator-title' variant='title-l' as='h2'>
            ¿Tienes que declarar renta este año?
          </Text>
          <Text variant='body-l' className='text-fg-secondary'>
            Escribe tu salario mensual y responde cinco preguntas. Te decimos al instante si pasas alguno de
            los topes de la DIAN para el año gravable {year.year}.
          </Text>
          <ul className='flex flex-col gap-2.5'>
            {[
              `Es un cálculo aproximado con los topes de ${String(year.year)} (1 UVT = ${formatCurrency(year.uvt)}).`,
              'No guardamos lo que escribes aquí.',
              'Dentro de la plataforma lo confirmamos con todos tus datos.',
            ].map(point => (
              <li key={point} className='flex items-start gap-2'>
                <Icon icon={LuCheck} size={16} className='mt-0.5 shrink-0 text-fg-success' />
                <Text variant='body-m' className='text-fg-secondary'>
                  {point}
                </Text>
              </li>
            ))}
          </ul>
        </div>

        <div
          {...revealItem(1)}
          className='reveal-item flex min-w-0 flex-1 flex-col gap-5 rounded-lg border border-line bg-surface p-5 lg:p-8'
        >
          <MoneyField
            name='monthlySalary'
            label='¿Cuánto recibías al mes por tu trabajo?'
            value={answers.monthlySalary}
            onChange={monthlySalary => {
              setAnswers(current => ({ ...current, monthlySalary }));
            }}
            hint='Salario antes de descuentos, con lo que te pagaban cada mes. Lo multiplicamos por 12.'
          />
          <Text variant='title-s' as='h3'>
            En {year.year}…
          </Text>
          <div className='flex flex-col gap-2'>
            {questions.map(question => (
              <ToggleField
                key={question.key}
                name={question.key}
                label={question.label}
                description={question.description}
                checked={answers[question.key]}
                onChange={checked => {
                  setAnswers(current => ({ ...current, [question.key]: checked }));
                }}
              />
            ))}
          </div>

          <div aria-live='polite'>
            {answered &&
              (check.mustFile ? (
                <Alert variant='warning' title='Sí debes declarar'>
                  {check.incomeExceeds
                    ? `Con ${salary} al mes recibiste unos ${annual} en ${String(year.year)} y pasas el tope de ingresos de ${incomeLimit}. Si tuviste otros ingresos, también suman.`
                    : 'Con lo que respondiste pasas al menos uno de los topes de la DIAN, y con uno solo ya debes declarar.'}
                </Alert>
              ) : (
                <Alert variant='success' title='Con estas respuestas no tienes que declarar'>
                  Con {salary} al mes recibiste unos {annual}, por debajo del tope de {incomeLimit}. Si
                  tuviste otros ingresos, como honorarios, arriendos o intereses, súmalos: pueden cambiar el
                  resultado.
                </Alert>
              ))}
          </div>

          <Button
            icon={LuArrowRight}
            className='self-stretch lg:self-start'
            onClick={() => void navigate(HOME_PATH)}
          >
            Preparar mi declaración
          </Button>
        </div>
      </div>
    </RevealSection>
  );
};
