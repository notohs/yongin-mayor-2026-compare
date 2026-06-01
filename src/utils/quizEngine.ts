import type { Candidate, Pledge, PledgeCategory } from '../data/types';
import type { QuizThemeDef } from '../data/quizThemes';

/** 단일 선택 가중치 */
export const SINGLE_WEIGHT = 1;
/** 2개 선택 시 각 공약 가중치(약간 감점) */
export const DOUBLE_WEIGHT = 0.7;
/** 검증 ‘내키지 않음’ 1건당 감점 */
export const RELUCTANT_PENALTY = 1;
/** 한 문항 최대 선택 개수 */
export const MAX_SELECT = 2;
/** 퀴즈 총 문항 상한 (공약이 많아 문항이 늘어도 이 수를 넘지 않음) */
export const MAX_QUIZ_QUESTIONS = 20;

/** 선택 개수에 따른 공약 가중치 */
export function weightForSelectionCount(count: number): number {
  return count >= MAX_SELECT ? DOUBLE_WEIGHT : SINGLE_WEIGHT;
}

// ── 정책(공약) 문항 ───────────────────────────────────
export interface QuizStepOption {
  candidateId: number;
  /** 결과 공개용 출처 제목(5대 공약 제목 또는 공보 분야명) */
  sourceTitle: string;
  blurb: string;
}

export interface PolicyStep {
  type: 'policy';
  id: string;
  category: PledgeCategory;
  question: string;
  options: QuizStepOption[];
}

// ── 검증(병역·체납·전과) 문항 ─────────────────────────
export type VerifyKind = 'military' | 'arrears' | 'criminal';

/** 검증 응답: 수용 / 내키지 않음(감점) / 절대 불가(배제) */
export type VerifyVerdict = 'ok' | 'reluctant' | 'never';

export interface VerifyStep {
  type: 'verify';
  id: string;
  kind: VerifyKind;
  /** 문항이 가리키는 후보 기호 (화면에는 노출하지 않음) */
  candidateId: number;
  /** 기록 내용(결과에서 공개) */
  recordText: string;
  /** 질문 문장 */
  prompt: string;
}

export type QuizStep = PolicyStep | VerifyStep;

// ── 사용자 응답 기록 ──────────────────────────────────
export interface QuizPick {
  stepId: string;
  category: PledgeCategory;
  question: string;
  candidateId: number;
  pledgeTitle: string;
  blurb: string;
  /** 이 선택의 가중치(1 또는 0.7) */
  weight: number;
}

export interface VerifyAnswer {
  stepId: string;
  kind: VerifyKind;
  candidateId: number;
  recordText: string;
  prompt: string;
  verdict: VerifyVerdict;
}

/** Fisher–Yates 셔플 (원본 보존, 새 배열 반환) */
function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 정책(공약) 문항 생성: 공약 연결 + 문항·선택지 순서 무작위 */
export function buildPolicySteps(
  candidates: Candidate[],
  themes: QuizThemeDef[],
): PolicyStep[] {
  const findPledge = (candidateId: number, rank: number): Pledge | undefined =>
    candidates
      .find((candidate) => candidate.id === candidateId)
      ?.pledges.find((pledge) => pledge.rank === rank);

  const steps: PolicyStep[] = themes.map((theme) => {
    const options: QuizStepOption[] = theme.options
      .map((option) => {
        const sourceTitle =
          option.pledgeRank !== undefined
            ? findPledge(option.candidateId, option.pledgeRank)?.title
            : option.sourceTitle;
        if (!sourceTitle) return null;
        return { candidateId: option.candidateId, sourceTitle, blurb: option.blurb };
      })
      .filter((option): option is QuizStepOption => option !== null);

    return {
      type: 'policy' as const,
      id: theme.id,
      category: theme.category,
      question: theme.question,
      options: shuffle(options),
    };
  });

  return shuffle(steps);
}

/** 검증(병역·체납·전과) 문항 생성: 후보의 부정적 기록에서 데이터 기반으로 생성 */
export function buildVerifySteps(candidates: Candidate[]): VerifyStep[] {
  const steps: VerifyStep[] = [];

  candidates.forEach((candidate) => {
    const { military, tax, criminal } = candidate;

    if (!military.completed) {
      steps.push({
        type: 'verify',
        id: `verify-military-${candidate.id}`,
        kind: 'military',
        candidateId: candidate.id,
        recordText: military.issueDescription ?? military.candidate,
        prompt: '병역을 제대로 마치지 못한 후보, 그래도 괜찮으신가요?',
      });
    }

    if (military.dependentCompleted === false) {
      steps.push({
        type: 'verify',
        id: `verify-military-dep-${candidate.id}`,
        kind: 'military',
        candidateId: candidate.id,
        recordText: military.note ?? '18세 이상 직계비속 병역 미이행',
        prompt: '18세 이상 직계비속이 병역을 마치지 못한 후보, 그래도 괜찮으신가요?',
      });
    }

    if (tax.hasArrearsRecord && tax.arrearsDescription) {
      steps.push({
        type: 'verify',
        id: `verify-arrears-${candidate.id}`,
        kind: 'arrears',
        candidateId: candidate.id,
        recordText: tax.arrearsDescription,
        prompt: `${tax.arrearsDescription}한 이력이 있는 후보, 그래도 괜찮으신가요?`,
      });
    }

    if (criminal.hasRecord) {
      criminal.items.forEach((item, index) => {
        steps.push({
          type: 'verify',
          id: `verify-criminal-${candidate.id}-${index}`,
          kind: 'criminal',
          candidateId: candidate.id,
          recordText: item,
          prompt: `‘${item}’ 전과가 있는 후보, 그래도 괜찮으신가요?`,
        });
      });
    }
  });

  return shuffle(steps);
}

/**
 * 정책 문항(앞) + 검증 문항(뒤) 순서로 전체 스텝 구성.
 * 총 문항이 MAX_QUIZ_QUESTIONS(20)를 넘으면 검증 문항을 우선 보존하고
 * 정책 문항을 무작위로 잘라 20개 이하로 맞춘다(문항이 적으면 있는 만큼 사용).
 */
export function buildQuizSteps(
  candidates: Candidate[],
  themes: QuizThemeDef[],
): QuizStep[] {
  const policy = buildPolicySteps(candidates, themes); // 셔플됨
  const verify = buildVerifySteps(candidates); // 셔플됨
  const verifyCapped = verify.slice(0, MAX_QUIZ_QUESTIONS);
  const policyRoom = Math.max(0, MAX_QUIZ_QUESTIONS - verifyCapped.length);
  const policyCapped = policy.slice(0, policyRoom);
  return [...policyCapped, ...verifyCapped];
}

/** 실제 출제될 정책·검증 문항 개수 사전 집계 (상한 반영) */
export function countSteps(
  candidates: Candidate[],
  themes: QuizThemeDef[],
): { policy: number; verify: number; total: number } {
  const verify = Math.min(buildVerifySteps(candidates).length, MAX_QUIZ_QUESTIONS);
  const policy = Math.min(themes.length, MAX_QUIZ_QUESTIONS - verify);
  return { policy, verify, total: policy + verify };
}

/** 정책 가중치 합에서 ‘내키지 않음’ 감점을 뺀 후보별 점수 (배제와 무관) */
export function computeScores(
  picks: QuizPick[],
  verifyAnswers: VerifyAnswer[],
  candidates: Candidate[],
): Record<number, number> {
  const scores: Record<number, number> = {};
  candidates.forEach((candidate) => {
    scores[candidate.id] = 0;
  });

  picks.forEach((pick) => {
    scores[pick.candidateId] = (scores[pick.candidateId] ?? 0) + pick.weight;
  });

  verifyAnswers.forEach((answer) => {
    if (answer.verdict === 'reluctant') {
      scores[answer.candidateId] = (scores[answer.candidateId] ?? 0) - RELUCTANT_PENALTY;
    }
  });

  Object.keys(scores).forEach((id) => {
    scores[Number(id)] = Math.round(scores[Number(id)] * 100) / 100;
  });

  return scores;
}

/** ‘절대 안된다’가 1건이라도 있으면 배제되는 후보 기호 목록 */
export function getDisqualifiedIds(verifyAnswers: VerifyAnswer[]): number[] {
  return Array.from(
    new Set(
      verifyAnswers
        .filter((answer) => answer.verdict === 'never')
        .map((answer) => answer.candidateId),
    ),
  );
}

/** 배제 후보를 제외하고 최고 점수 후보(동점이면 복수)의 기호 목록 */
export function recommendCandidates(
  scores: Record<number, number>,
  disqualifiedIds: number[] = [],
): number[] {
  const eligible = Object.keys(scores)
    .map(Number)
    .filter((id) => !disqualifiedIds.includes(id));
  if (eligible.length === 0) return [];
  const max = Math.max(...eligible.map((id) => scores[id]));
  return eligible.filter((id) => scores[id] === max);
}
