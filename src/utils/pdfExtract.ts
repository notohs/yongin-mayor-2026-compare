import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/** 페이지 텍스트가 이보다 적으면(공백 제외) 이미지 페이지로 보고 OCR */
const OCR_TEXT_THRESHOLD = 30;
/** OCR 렌더링 배율 */
const OCR_SCALE = 2;

export interface PdfExtractResult {
  /** 파일명 */
  name: string;
  /** 페이지별 텍스트 */
  pages: string[];
  /** 전체 텍스트 */
  text: string;
  /** OCR을 사용한 페이지가 있는지 */
  usedOcr: boolean;
}

export interface ExtractProgress {
  (message: string): void;
}

const nonSpaceLen = (s: string) => s.replace(/\s/g, '').length;

/** pdf.js 페이지를 캔버스로 렌더링 */
async function renderPageToCanvas(
  page: pdfjsLib.PDFPageProxy,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: OCR_SCALE });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas 2d 컨텍스트를 만들 수 없습니다.');
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

/**
 * PDF에서 텍스트를 추출한다. 임베드된 텍스트가 있으면 그대로 사용하고,
 * 텍스트가 거의 없는(스캔 이미지) 페이지는 tesseract.js로 OCR(한국어)한다.
 * 모든 처리는 브라우저 안에서 일어나며 외부로 업로드되지 않는다.
 */
export async function extractPdf(
  file: File,
  onProgress?: ExtractProgress,
): Promise<PdfExtractResult> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageCount = pdf.numPages;

  const pages: string[] = [];
  const ocrPageIndexes: number[] = [];

  for (let i = 1; i <= pageCount; i += 1) {
    onProgress?.(`${file.name}: 텍스트 추출 ${i}/${pageCount}`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();
    pages.push(text);
    if (nonSpaceLen(text) < OCR_TEXT_THRESHOLD) ocrPageIndexes.push(i);
  }

  let usedOcr = false;

  if (ocrPageIndexes.length > 0) {
    usedOcr = true;
    onProgress?.(`${file.name}: 이미지 ${ocrPageIndexes.length}쪽 OCR 준비 중(한국어 모델 내려받는 중)…`);
    // tesseract는 필요할 때만 로드(용량이 큼)
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('kor', undefined, {
      logger: () => {},
    });
    try {
      for (const pageIndex of ocrPageIndexes) {
        onProgress?.(`${file.name}: OCR ${pageIndex}/${pageCount}쪽…`);
        const page = await pdf.getPage(pageIndex);
        const canvas = await renderPageToCanvas(page);
        const { data } = await worker.recognize(canvas);
        pages[pageIndex - 1] = data.text.trim();
        canvas.width = 0;
        canvas.height = 0;
      }
    } finally {
      await worker.terminate();
    }
  }

  const text = pages
    .map((p, idx) => `----- ${file.name} p.${idx + 1} -----\n${p}`)
    .join('\n\n');

  return { name: file.name, pages, text, usedOcr };
}
