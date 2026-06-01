import type { Election } from '../types';

// 선거구 자동 등록:
// src/data/regions/<선거구-id>/index.ts 가 `election: Election` 을 export 하면
// 아래 glob 이 자동으로 수집해 앱 전체(종합비교·공약비교·인물검증·공약퀴즈)에 반영한다.
// 새 선거구를 추가하려면 폴더만 만들면 되고, 이 파일은 수정할 필요가 없다.
// (밑줄 `_` 로 시작하는 폴더는 제외 — 예: 작성 중 임시 폴더)
const modules = import.meta.glob<{ election: Election }>('./*/index.ts', { eager: true });

export const elections: Election[] = Object.entries(modules)
  .filter(([path]) => !path.includes('/_'))
  .map(([, mod]) => mod.election)
  // 후보가 아직 없는(작성 중) 선거구는 노출하지 않는다
  .filter((election) => election.candidates.length > 0)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
