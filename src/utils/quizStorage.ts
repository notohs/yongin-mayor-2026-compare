import type { QuizPick, VerifyAnswer } from './quizEngine';

const STORAGE_KEY = 'quiz-results-v3';
const MAX_RESULTS = 50;

/** 저장되는 퀴즈 결과 1건 */
export interface QuizResult {
  id: string;
  /** 선거(지역) 식별자 */
  electionId: string;
  nickname: string;
  /** 저장 시각(ISO 8601) */
  date: string;
  /** 후보별 최종 점수 (정책 가중치 합 − 검증 감점) */
  scores: Record<number, number>;
  /** ‘절대 안된다’로 배제된 후보 기호 */
  disqualifiedIds: number[];
  /** 추천 후보 기호(배제 제외, 동점이면 복수) */
  recommendedIds: number[];
  /** 정책 문항 선택 내역(가중치 포함) */
  picks: QuizPick[];
  /** 검증 문항 응답 내역 */
  verifyAnswers: VerifyAnswer[];
}

function isStorageAvailable(): boolean {
  try {
    const testKey = '__quiz_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** 저장된 모든 결과를 최신순으로 반환 */
export function loadResults(): QuizResult[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QuizResult[];
  } catch {
    return [];
  }
}

/** 결과 1건을 저장하고 갱신된 전체 목록을 반환 (최신이 앞) */
export function saveResult(result: QuizResult): QuizResult[] {
  const next = [result, ...loadResults()].slice(0, MAX_RESULTS);
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장 실패는 조용히 무시 (용량 초과 등)
    }
  }
  return next;
}

/** 특정 결과 삭제 후 갱신된 목록 반환 */
export function deleteResult(id: string): QuizResult[] {
  const next = loadResults().filter((result) => result.id !== id);
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 무시
    }
  }
  return next;
}

/** 모든 결과 삭제 */
export function clearResults(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}

/** 특정 선거(지역)의 결과만 삭제하고 갱신된 전체 목록 반환 */
export function clearElectionResults(electionId: string): QuizResult[] {
  const next = loadResults().filter((result) => result.electionId !== electionId);
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 무시
    }
  }
  return next;
}

/** 결과 ID 생성 (브라우저 환경 전용) */
export function createResultId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
