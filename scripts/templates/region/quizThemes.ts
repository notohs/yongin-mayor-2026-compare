import type { QuizThemeDef } from '../../types';

// 공약 블라인드 퀴즈의 "정책 문항".
// - 비슷한 주제에서 후보별 접근이 다른 지점을 한 문항으로 묶습니다.
// - blurb 는 어느 후보인지 드러나지 않게 정책 내용만 중립적으로 요약합니다.
// - 선택지가 3개면 화면에서 최대 2개, 2개면 1개만 선택됩니다.
// - 검증 문항(병역·체납·전과)은 후보 데이터에서 자동 생성되므로 여기 적지 않습니다.
// - 전체 문항 수는 최대 20개로 제한됩니다(quizEngine MAX_QUIZ_QUESTIONS).
//
// ── 작성 예시 ───────────────────────────────────────────────
// export const quizThemes: QuizThemeDef[] = [
//   {
//     id: 'transport',
//     category: 'transport',
//     question: '출퇴근·이동 불편, 어떻게 푸는 방식이 더 끌리나요?',
//     options: [
//       { candidateId: 1, pledgeRank: 2, blurb: '...' },          // 5대 공약 연결
//       { candidateId: 2, pledgeRank: 2, blurb: '...' },
//       { candidateId: 3, sourceTitle: '선거공보 · 교통', blurb: '...' }, // 공보 기반
//     ],
//   },
// ];
export const quizThemes: QuizThemeDef[] = [];
