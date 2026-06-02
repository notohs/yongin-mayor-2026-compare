import type { BulletinData } from '../../types';

// 후보별 선거공보 세부 공약(5대 공약 외). 기호 번호를 키로 사용.
// 자료가 없으면 빈 객체로 두어도 됩니다(공약 비교의 '분야별 비교'에서 5대 공약만 표시).
//
// ── 작성 예시 ───────────────────────────────────────────────
// export const bulletinPolicies: Record<number, BulletinData> = {
//   1: {
//     note: '선거공보 분야별 정책공약',
//     groups: [
//       {
//         field: '교통',
//         category: 'transport',   // 표준 분야(비교·집계 기준)
//         headline: '헤드라인(선택)',
//         icon: '🚆',
//         items: ['세부 공약1', '세부 공약2'],
//       },
//     ],
//   },
// };
export const bulletinPolicies: Record<number, BulletinData> = {};
