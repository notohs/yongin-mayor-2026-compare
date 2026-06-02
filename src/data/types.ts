// 모든 후보가 공유하는 단일 데이터 포맷 정의.
// 출처: 중앙선거관리위원회 후보자정보공개자료 및 5대 공약 자료(2026 용인특례시장 선거)

/** 공약 분야 카테고리 키 */
export type PledgeCategory =
  | 'transport' // 교통
  | 'semiconductor' // 반도체·미래산업
  | 'economy' // 경제·일자리
  | 'welfare' // 복지·생활
  | 'urban' // 도시·개발
  | 'education' // 교육
  | 'culture' // 문화·관광
  | 'housing'; // 주거·환경

/** 5대 공약 1건 */
export interface Pledge {
  /** 공약 순위(1~5) */
  rank: number;
  /** 공약 제목 */
  title: string;
  /** 공약 분야 */
  category: PledgeCategory;
  /** 목표 */
  goals: string[];
  /** 이행방법 */
  methods: string[];
  /** 이행기간 */
  period: string[];
  /** 재원조달방안 */
  funding: string[];
}

/** 전과 기록 */
export interface CriminalRecord {
  /** 전과 보유 여부 */
  hasRecord: boolean;
  /** 전과 항목(없으면 빈 배열) */
  items: string[];
}

/**
 * 세금 납부·체납 실적 (단위: 천원)
 * 최근 5년간 소득세·재산세·종합부동산세 기준
 */
export interface TaxRecord {
  /** 본인+가족 합계 납세액 */
  totalPaid: number;
  /** 후보자 본인 납세액 */
  candidatePaid: number;
  /** 현 체납액 */
  currentArrears: number;
  /** 체납 관련 비고(완납 이력 등) */
  note?: string;
  /** 과거·현재 체납 이력 보유 여부 (검증 문항 생성 기준) */
  hasArrearsRecord: boolean;
  /** 체납 검증 문항용 설명(체납 이력이 있을 때) */
  arrearsDescription?: string;
}

/** 병역 사항 */
export interface MilitaryRecord {
  /** 후보자 본인 병역 */
  candidate: string;
  /** 직계비속 등 추가 병역 비고 */
  note?: string;
  /** 후보자 본인 병역 정상 이행 여부 */
  completed: boolean;
  /** 18세 이상 직계비속 병역 이행 여부 (해당 없으면 null) */
  dependentCompleted: boolean | null;
  /** 병역 미이행 시 검증 문항용 설명 */
  issueDescription?: string;
}

/**
 * 재산 상황 (단위: 천원)
 * 음수는 채무 초과를 의미
 */
export interface AssetRecord {
  /** 신고 재산 총계 */
  total: number;
  /** 후보자 본인 */
  candidate: number;
  /** 배우자(고지거부 시 null) */
  spouse: number | null;
  /** 직계존비속 등 구성 설명 */
  breakdown: string;
}

/** 선거공보 분야별 공약 묶음 (5대 공약 외 세부 공약) */
export interface PolicyGroup {
  /** 분야명 */
  field: string;
  /** 비교·집계용 표준 분야 카테고리 */
  category: PledgeCategory;
  /** 공보 헤드라인(선택) */
  headline?: string;
  /** 분야 아이콘(이모지) */
  icon: string;
  /** 세부 공약 목록 */
  items: string[];
}

/** 후보자별 선거공보 세부 공약 데이터 */
export interface BulletinData {
  /** 자료 성격/범위 설명 */
  note: string;
  /** 분야별 공약 묶음 */
  groups: PolicyGroup[];
}

/** 공약 적정성 종합 판정 */
export type ReviewVerdict = 'sound' | 'caution' | 'unsound'; // 적정 / 주의 / 부적정

/**
 * 공약의 성격 — 평가 기준이 다르다.
 * commitment(공약): "임기 내에 ~하겠다"는 실행 약속 → 임기 내 이행 가능성으로 평가.
 * aspiration(목표): "언젠가 ~되도록 초석을 다지겠다"는 장기 지향 → 임기 내 미달성으로 깎지 않되,
 *   장기 비전을 '임기 내 성과'처럼 과장했는지 / 초석 단계가 구체적인지로 평가.
 */
export type PledgeNature = 'commitment' | 'aspiration';

/** 5대 공약 1건에 대한 타 정당 교차 적정성 평가 */
export interface PledgeReviewItem {
  /** 대응하는 5대 공약 rank */
  rank: number;
  /** 공약 제목(참조) */
  title: string;
  /** 공약 성격 — 공약(임기 내 이행) / 목표(장기 지향·초석). 평가 기준이 다름 */
  nature: PledgeNature;
  /** 실현 가능성 평가 — "등급 — 근거" 형식(등급=상/중/하) */
  feasibility: string;
  /** 구체성 평가 — "등급 — 근거" 형식(등급=구체적/보통/모호) */
  specificity: string;
  /** (현직 등) 본인이 시작한 사업을 계속·완성하겠다는 연속성 — 긍정·신뢰 지표 + 근거. 없으면 생략 */
  continuity?: string;
  /** 본인 사업이 아닌, 이미 추진 중인 외부·국가·전임 사업에 편승한 정황 + 근거(주의). 없으면 생략 */
  inProgress?: string;
  /** 타·과거 후보 공약을 재활용(베끼기)했거나 동일한 정황 + 근거(주의). 없으면 생략 */
  recycled?: string;
  /** 종합 판정 (반론·재심 반영된 최종 등급) */
  verdict: ReviewVerdict;
  /** 종합 사유 (한 줄) — 주의·부적정 분류의 핵심 근거 */
  comment: string;
  /** 균형패널 표결 결과 (후보 소속을 뺀 4개 정당 다수결) */
  panel?: string;
}

/** 후보자 공약 적정성 교차검증 묶음 (집계는 items에서 자동 계산) */
export interface CandidateReview {
  /** 검증을 수행한 (타) 정당 */
  reviewer: string;
  /** 평가 출처(후보가 제출한 공식 자료) — 근거 명시용 */
  source: string;
  /** 5대 공약별 평가 */
  items: PledgeReviewItem[];
}

/** "등급 — 근거" 문자열을 등급(badge)과 근거(text)로 분리 */
export function splitCriterion(value: string): { level: string; note: string } {
  const idx = value.indexOf('—');
  if (idx < 0) return { level: '', note: value.trim() };
  return { level: value.slice(0, idx).trim(), note: value.slice(idx + 1).trim() };
}

/** items에서 적정/주의/부적정 개수를 집계 (수동 동기화 footgun 제거) */
export function tallyVerdicts(items: PledgeReviewItem[]): {
  sound: number;
  caution: number;
  unsound: number;
} {
  return {
    sound: items.filter((it) => it.verdict === 'sound').length,
    caution: items.filter((it) => it.verdict === 'caution').length,
    unsound: items.filter((it) => it.verdict === 'unsound').length,
  };
}

/**
 * 선관위 제출 자료 등록 현황 (성실 제출 참고 지표)
 * 선거공보 / 선거공약서 / 5대공약 — 후보가 등록했는지 여부
 */
export interface MaterialSubmission {
  /** 선거공보 등록 */
  bulletin: boolean;
  /** 선거공약서 등록 */
  pledgeBook: boolean;
  /** 5대공약 등록 */
  fivePledges: boolean;
}

/** 후보자 단일 레코드 */
export interface Candidate {
  /** 기호 */
  id: number;
  /** 성명 */
  name: string;
  /** 소속 정당 */
  party: string;
  /** 정당 대표 색상(HEX) */
  partyColor: string;
  /** 주요 슬로건 */
  slogan: string;
  /** 보조 슬로건 */
  subSlogan?: string;
  /** 한 줄 비전 요약 */
  vision: string;
  /** 생년월일(YYYY.MM.DD) */
  birth: string;
  /** 만 나이 */
  age: number;
  /** 성별 */
  gender: string;
  /** 직업 */
  job: string;
  /** 학력 */
  education: string;
  /** 주요 경력 */
  careers: string[];
  /** 선거공보 표지 이미지 경로 */
  poster: string;
  /** 5대 공약 */
  pledges: Pledge[];
  /** 전과 */
  criminal: CriminalRecord;
  /** 납세 */
  tax: TaxRecord;
  /** 병역 */
  military: MilitaryRecord;
  /** 재산 */
  assets: AssetRecord;
  /** 선관위 제출 자료 등록 현황 (성실 제출 지표) */
  materials: MaterialSubmission;
}

/** 선거 메타 정보 */
export interface ElectionMeta {
  /** 지역/선거 짧은 이름 (선택기 표시용, 예: "용인특례시장") */
  region: string;
  title: string;
  subtitle: string;
  note: string;
  source: string;
}

/** 공약 블라인드 퀴즈 선택지 정의 (후보·공약 연결 + 익명 요약) */
export interface QuizOptionDef {
  /** 연결된 후보 기호 */
  candidateId: number;
  /** 연결된 5대 공약 순위(candidate.pledges 의 rank). 공보 기반 문항은 생략 */
  pledgeRank?: number;
  /** pledgeRank가 없을 때 결과 공개용 출처 제목(예: '선거공보 · 교육·보육') */
  sourceTitle?: string;
  /** 후보를 드러내지 않는 접근 요약(퀴즈 화면에 표시) */
  blurb: string;
}

/** 공약 블라인드 퀴즈 1문항(테마) 정의 */
export interface QuizThemeDef {
  id: string;
  /** 대표 분야(아이콘·라벨용) */
  category: PledgeCategory;
  /** 사용자에게 보이는 질문 */
  question: string;
  options: QuizOptionDef[];
}

/**
 * 하나의 선거(선거구) 단위 데이터 묶음.
 * 새 선거구를 추가하려면 src/data/regions/<id>/ 폴더를 만들고 이 형태의 election 객체를 export 한다.
 * regions/index.ts 가 폴더를 자동으로 수집해 앱 전체(종합비교·공약비교·인물검증·공약퀴즈)에 반영한다.
 */
export interface Election {
  /** 선거구 식별자(폴더명과 동일 권장) */
  id: string;
  /** 선택기 정렬 순서(작을수록 먼저) */
  order?: number;
  /** 선거/지역 메타 */
  meta: ElectionMeta;
  /** 후보 목록(동일 Candidate 포맷) */
  candidates: Candidate[];
  /** 후보별 선거공보 세부 공약(기호 → BulletinData) */
  bulletinPolicies: Record<number, BulletinData>;
  /** 후보별 공약 적정성 교차검증(기호 → CandidateReview). 선택 — 없으면 표시·퀴즈 생략 */
  pledgeReviews?: Record<number, CandidateReview>;
  /** 공약 퀴즈 정책 문항(검증 문항은 후보 데이터에서 자동 생성) */
  quizThemes: QuizThemeDef[];
}
