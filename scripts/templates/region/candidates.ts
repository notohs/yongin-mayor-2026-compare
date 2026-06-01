import type { Candidate } from '../../types';

// 후보 목록(동일 Candidate 포맷). 후보가 1명 이상 채워지면 이 선거구가 앱에 자동 노출됩니다.
// 금액 단위는 천원, 재산 음수(△)는 채무 초과.
// 포스터 이미지는 public/posters/ 에 두고 'posters/<파일>.jpg' 로 참조합니다.
//
// ── 작성 예시 (주석을 풀어 채우세요) ────────────────────────────
// export const candidates: Candidate[] = [
//   {
//     id: 1,                       // 기호
//     name: '홍길동',
//     party: '○○당',
//     partyColor: '#1d4ed8',       // 정당 대표색(HEX)
//     slogan: '메인 슬로건',
//     subSlogan: '보조 슬로건',     // 선택
//     vision: '한 줄 비전 요약.',
//     birth: '1970.01.01',
//     age: 55,
//     gender: '남',
//     job: '직업',
//     education: '○○대학교 ○○학과 졸업',
//     careers: ['前 ...', '現 ...'],
//     poster: 'posters/region-1.jpg',
//     pledges: [
//       {
//         rank: 1,
//         title: '공약 제목',
//         category: 'transport',   // transport|semiconductor|economy|welfare|urban|education|culture|housing
//         goals: ['목표1'],
//         methods: ['이행방법1'],
//         period: ['이행기간'],
//         funding: ['재원조달'],
//       },
//       // ... 보통 5개
//     ],
//     criminal: { hasRecord: false, items: [] },
//     tax: { totalPaid: 0, candidatePaid: 0, currentArrears: 0, hasArrearsRecord: false },
//     military: { candidate: '병역 사항', completed: true, dependentCompleted: null },
//     assets: { total: 0, candidate: 0, spouse: 0, breakdown: '' },
//     // 선관위 자료 제출 현황(성실 제출 지표). 미등록은 false.
//     materials: { bulletin: true, pledgeBook: true, fivePledges: true },
//   },
// ];
export const candidates: Candidate[] = [];
