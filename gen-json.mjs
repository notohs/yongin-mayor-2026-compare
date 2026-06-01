import { build } from 'esbuild';
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
const out='/tmp/elections.bundle.mjs';
await build({entryPoints:['src/data/elections.ts'],bundle:true,format:'esm',outfile:out,logLevel:'silent'});
const mod = await import(pathToFileURL(out).href);
const elections = mod.elections.map(e => ({ id:e.id, meta:e.meta, candidates: e.candidates.map(c=>({...c, bulletin: e.bulletinPolicies[c.id] ?? {note:'',groups:[]}})) }));
writeFileSync('../candidates.json', JSON.stringify({ elections }, null, 2));
writeFileSync('public/candidates.json', JSON.stringify({ elections }, null, 2));
// 퀴즈 문항 수
const themes = (await import(pathToFileURL((await (async()=>{const o='/tmp/qt.mjs';await build({entryPoints:['src/data/quizThemes.ts'],bundle:true,format:'esm',outfile:o,logLevel:'silent'});return o;})()).href)).quizThemes);
console.log('정책 퀴즈 테마 수:', themes.length, '/ 3지선다:', themes.filter(t=>t.options.length===3).length, '/ 2지선다:', themes.filter(t=>t.options.length===2).length);
