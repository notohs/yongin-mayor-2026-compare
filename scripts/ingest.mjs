#!/usr/bin/env node
// 업로드한 선거공보·공약집 PDF에서 텍스트를 추출한다(이미지 PDF는 OCR).
// 사용법: npm run ingest <region-id>
//   입력:  data-sources/<region-id>/*.pdf
//   출력:  _ingest/<region-id>/<파일>.txt  (이 텍스트를 보고 region 데이터 모듈을 채운다)
// 필요 도구: pdftotext, pdftoppm (poppler), tesseract (한국어: kor)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id) {
  console.error('사용법: npm run ingest <region-id>');
  process.exit(1);
}

const TEXT_MIN = 200; // 추출 글자수가 이보다 적으면 이미지 PDF로 보고 OCR

const has = (cmd) => {
  try {
    execFileSync('which', [cmd], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const srcDir = path.join(root, 'data-sources', id);
if (!existsSync(srcDir)) {
  console.error(`원자료 폴더가 없습니다: data-sources/${id}/  (PDF를 넣어주세요)`);
  process.exit(1);
}
if (!has('pdftotext')) {
  console.error('pdftotext(poppler)가 필요합니다.  brew install poppler');
  process.exit(1);
}
const canOcr = has('pdftoppm') && has('tesseract');
if (!canOcr) {
  console.warn('⚠ pdftoppm/tesseract가 없어 이미지 PDF는 OCR하지 못합니다. (brew install poppler tesseract tesseract-lang)');
}

const outDir = path.join(root, '_ingest', id);
mkdirSync(outDir, { recursive: true });

const pdfs = readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
if (pdfs.length === 0) {
  console.error(`PDF가 없습니다: data-sources/${id}/`);
  process.exit(1);
}

const nonSpace = (s) => s.replace(/\s/g, '').length;

for (const pdf of pdfs) {
  const full = path.join(srcDir, pdf);
  const base = pdf.replace(/\.pdf$/i, '');
  let text = '';
  let method = 'text';
  try {
    text = execFileSync('pdftotext', ['-layout', full, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch {
    text = '';
  }

  if (nonSpace(text) < TEXT_MIN && canOcr) {
    method = 'ocr';
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'ingest-'));
    try {
      execFileSync('pdftoppm', ['-png', '-r', '200', full, path.join(tmp, 'p')]);
      const pages = readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
      const parts = [];
      for (const pg of pages) {
        try {
          const t = execFileSync('tesseract', [path.join(tmp, pg), 'stdout', '-l', 'kor+eng', '--psm', '3'], {
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024,
          });
          parts.push(`\n----- ${pg} -----\n${t}`);
        } catch {
          parts.push(`\n----- ${pg} (OCR 실패) -----\n`);
        }
      }
      text = parts.join('\n');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  writeFileSync(path.join(outDir, `${base}.txt`), text);
  console.log(`• ${pdf}  →  _ingest/${id}/${base}.txt  [${method}, ${nonSpace(text)}자]`);
}

console.log(`\n✅ 추출 완료. _ingest/${id}/ 의 텍스트를 보고 src/data/regions/${id}/ 모듈을 채우세요.`);
console.log('   (이미지 OCR 결과는 오탈자가 있을 수 있어 사람이 검수·정리해야 합니다.)');
