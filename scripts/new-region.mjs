#!/usr/bin/env node
// 새 선거구 데이터 모듈을 템플릿에서 스캐폴딩한다.
// 사용법: npm run new:region <region-id>   (예: npm run new:region seongnam-mayor-2026)
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];

if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error('사용법: npm run new:region <region-id>   (소문자/숫자/하이픈만)');
  process.exit(1);
}

const dest = path.join(root, 'src/data/regions', id);
if (existsSync(dest)) {
  console.error(`이미 존재합니다: src/data/regions/${id}`);
  process.exit(1);
}

const tplDir = path.join(root, 'scripts/templates/region');
await mkdir(dest, { recursive: true });
for (const file of await readdir(tplDir)) {
  const content = (await readFile(path.join(tplDir, file), 'utf8')).replaceAll('__REGION_ID__', id);
  await writeFile(path.join(dest, file), content);
}
await mkdir(path.join(root, 'data-sources', id), { recursive: true });

console.log(`✅ 선거구 모듈 생성: src/data/regions/${id}/`);
console.log('   - meta.ts / candidates.ts / bulletinPolicies.ts / quizThemes.ts / index.ts');
console.log(`📂 원자료 폴더 생성: data-sources/${id}/  (여기에 선거공보·공약집 PDF를 넣으세요)`);
console.log(`▶ 다음 단계: npm run ingest ${id}  → _ingest/${id}/ 의 추출 텍스트를 보고 candidates 등을 채우면`);
console.log('   앱(종합비교·공약비교·인물검증·공약퀴즈)에 자동으로 나타납니다.');
