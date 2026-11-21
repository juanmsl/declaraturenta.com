import { parsePreviousReturn } from '@/domain/previous-return';
import type { PageText, PreviousReturn } from '@/domain/previous-return';

/**
 * Reads last year's Formulario 210 PDF in the browser with PDF.js (ADR 0048). Loaded on demand,
 * with its worker served from the app itself (allowed by the CSP, ADR 0039).
 */
export const readPreviousReturn = async (file: File): Promise<PreviousReturn> => {
  const [{ getDocument, GlobalWorkerOptions }, { default: workerUrl }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  GlobalWorkerOptions.workerSrc = workerUrl;

  const loading = getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const document = await loading.promise;
    const page = await document.getPage(1);
    const { width, height } = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const texts: PageText[] = content.items.flatMap(item =>
      'str' in item && item.str.trim() !== ''
        ? [
            {
              text: item.str,
              x: item.transform[4] as number,
              right: (item.transform[4] as number) + item.width,
              baseline: height - (item.transform[5] as number),
            },
          ]
        : [],
    );
    return parsePreviousReturn(texts, { width, height });
  } finally {
    void loading.destroy();
  }
};
