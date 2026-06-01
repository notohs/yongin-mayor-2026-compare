import type { BulletinData, Candidate, ElectionMeta } from './types';
import type { QuizThemeDef } from './quizThemes';
import { candidates as yonginCandidates, electionMeta as yonginMeta } from './candidates';
import { bulletinPolicies as yonginBulletin } from './bulletinPolicies';
import { quizThemes as yonginQuizThemes } from './quizThemes';

/**
 * 하나의 선거(지역) 단위 데이터 묶음.
 * 다른 시·구의 자료를 추가하려면 같은 형태의 객체를 elections 배열에 넣으면 된다.
 * - meta: 지역/선거 정보
 * - candidates: 후보 목록(동일 Candidate 포맷)
 * - bulletinPolicies: 후보별 선거공보 세부 공약(기호 → BulletinData)
 * - quizThemes: 공약 블라인드 퀴즈의 정책 문항(후보·공약 매핑). 검증 문항(병역·체납·전과)은
 *   후보 데이터에서 자동 생성되므로 별도 정의가 필요 없다.
 */
export interface Election {
  id: string;
  meta: ElectionMeta;
  candidates: Candidate[];
  bulletinPolicies: Record<number, BulletinData>;
  quizThemes: QuizThemeDef[];
}

export const elections: Election[] = [
  {
    id: 'yongin-mayor-2026',
    meta: yonginMeta,
    candidates: yonginCandidates,
    bulletinPolicies: yonginBulletin,
    quizThemes: yonginQuizThemes,
  },
  // 다른 지역 추가 예시:
  // {
  //   id: 'seongnam-mayor-2026',
  //   meta: seongnamMeta,
  //   candidates: seongnamCandidates,
  //   bulletinPolicies: seongnamBulletin,
  //   quizThemes: seongnamQuizThemes,
  // },
];
