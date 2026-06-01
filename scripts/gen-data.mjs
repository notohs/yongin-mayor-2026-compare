#!/usr/bin/env node
// 모든 선거구 모듈을 모아 포터블 데이터(candidates.json)를 생성한다.
// 사용법: npm run gen:data
//   출력: ../candidates.json, public/candidates.json  형식: { elections: [...] }
import { build } from 'esbuild';
import { writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const regionsDir = path.join(root, 'src/data/regions');

const ids = readdirSync(regionsDir).filter(
  (d) => !d.startsWith('_') && statSync(path.join(regionsDir, d)).isDirectory(),
);

const elections = [];
for (const id of ids) {
  const entry = path.join(regionsDir, id, 'index.ts');
  const out = path.join(root, `node_modules/.cache-region-${id}.mjs`);
  await build({ entryPoints: [entry], bundle: true, format: 'esm', outfile: out, logLevel: 'silent' });
  const mod = await import(pathToFileURL(out).href);
  const e = mod.election;
  if (!e?.candidates?.length) continue;
  elections.push({
    id: e.id,
    order: e.order ?? 99,
    meta: e.meta,
    candidates: e.candidates.map((c) => ({
      ...c,
      bulletin: e.bulletinPolicies[c.id] ?? { note: '', groups: [] },
    })),
  });
}

elections.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
const json = JSON.stringify({ elections: elections.map(({ order, ...rest }) => rest) }, null, 2);
writeFileSync(path.join(root, '..', 'candidates.json'), json);
writeFileSync(path.join(root, 'public', 'candidates.json'), json);

console.log(`✅ candidates.json 생성 — 선거구 ${elections.length}개`);
elections.forEach((e) => console.log(`   - ${e.id}: 후보 ${e.candidates.length}명`));
