import type {
  AssetRecord,
  BulletinData,
  Candidate,
  CriminalRecord,
  Election,
  ElectionMeta,
  MilitaryRecord,
  Pledge,
  PledgeCategory,
  TaxRecord,
} from '../data/types';

const STORAGE_KEY = 'custom-elections-v1';
/** 커스텀 선거구는 빌트인(order 1~) 뒤에 오도록 기본 정렬값을 크게 둔다 */
const DEFAULT_ORDER = 50;

const CATEGORIES: PledgeCategory[] = [
  'transport',
  'semiconductor',
  'economy',
  'welfare',
  'urban',
  'education',
  'culture',
  'housing',
];

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && !Number.isNaN(v) ? v : fallback);
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const strArr = (v: unknown): string[] => arr<unknown>(v).map((x) => str(x)).filter(Boolean);
const category = (v: unknown): PledgeCategory =>
  CATEGORIES.includes(v as PledgeCategory) ? (v as PledgeCategory) : 'economy';

function normPledge(raw: unknown, index: number): Pledge {
  const p = (raw ?? {}) as Record<string, unknown>;
  return {
    rank: num(p.rank, index + 1),
    title: str(p.title, `공약 ${index + 1}`),
    category: category(p.category),
    goals: strArr(p.goals),
    methods: strArr(p.methods),
    period: strArr(p.period),
    funding: strArr(p.funding),
  };
}

function normCriminal(raw: unknown): CriminalRecord {
  const c = (raw ?? {}) as Record<string, unknown>;
  const items = strArr(c.items);
  return { hasRecord: typeof c.hasRecord === 'boolean' ? c.hasRecord : items.length > 0, items };
}

function normTax(raw: unknown): TaxRecord {
  const t = (raw ?? {}) as Record<string, unknown>;
  return {
    totalPaid: num(t.totalPaid),
    candidatePaid: num(t.candidatePaid),
    currentArrears: num(t.currentArrears),
    note: typeof t.note === 'string' ? t.note : undefined,
    hasArrearsRecord:
      typeof t.hasArrearsRecord === 'boolean' ? t.hasArrearsRecord : Boolean(t.arrearsDescription),
    arrearsDescription: typeof t.arrearsDescription === 'string' ? t.arrearsDescription : undefined,
  };
}

function normMilitary(raw: unknown): MilitaryRecord {
  const m = (raw ?? {}) as Record<string, unknown>;
  return {
    candidate: str(m.candidate, '미상'),
    note: typeof m.note === 'string' ? m.note : undefined,
    completed: typeof m.completed === 'boolean' ? m.completed : true,
    dependentCompleted:
      typeof m.dependentCompleted === 'boolean' ? m.dependentCompleted : null,
    issueDescription: typeof m.issueDescription === 'string' ? m.issueDescription : undefined,
  };
}

function normAssets(raw: unknown): AssetRecord {
  const a = (raw ?? {}) as Record<string, unknown>;
  return {
    total: num(a.total),
    candidate: num(a.candidate),
    spouse: typeof a.spouse === 'number' ? a.spouse : null,
    breakdown: str(a.breakdown),
  };
}

function normCandidate(raw: unknown, index: number): Candidate {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    id: num(c.id, index + 1),
    name: str(c.name, `후보 ${index + 1}`),
    party: str(c.party, '무소속'),
    partyColor: str(c.partyColor, '#64748b'),
    slogan: str(c.slogan),
    subSlogan: typeof c.subSlogan === 'string' ? c.subSlogan : undefined,
    vision: str(c.vision),
    birth: str(c.birth),
    age: num(c.age),
    gender: str(c.gender),
    job: str(c.job),
    education: str(c.education),
    careers: strArr(c.careers),
    poster: str(c.poster),
    pledges: arr<unknown>(c.pledges).map(normPledge),
    criminal: normCriminal(c.criminal),
    tax: normTax(c.tax),
    military: normMilitary(c.military),
    assets: normAssets(c.assets),
  };
}

function normMeta(raw: unknown, id: string): ElectionMeta {
  const m = (raw ?? {}) as Record<string, unknown>;
  return {
    region: str(m.region, id),
    title: str(m.title, `${str(m.region, id)} 후보 비교`),
    subtitle: str(m.subtitle, '업로드 데이터'),
    note: str(m.note, '관리자 콘솔에서 업로드·작성한 데이터입니다.'),
    source: str(m.source, '선거공보 등 후보 제출 자료'),
  };
}

function normBulletin(raw: unknown): Record<number, BulletinData> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<number, BulletinData> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const v = (value ?? {}) as Record<string, unknown>;
    out[Number(key)] = {
      note: str(v.note),
      groups: arr<Record<string, unknown>>(v.groups).map((g) => ({
        field: str(g.field, '기타'),
        category: category(g.category),
        headline: typeof g.headline === 'string' ? g.headline : undefined,
        icon: str(g.icon, '📌'),
        items: strArr(g.items),
      })),
    };
  }
  return out;
}

function normQuizThemes(raw: unknown): Election['quizThemes'] {
  return arr<Record<string, unknown>>(raw).map((t, i) => ({
    id: str(t.id, `theme-${i}`),
    category: category(t.category),
    question: str(t.question, '질문'),
    options: arr<Record<string, unknown>>(t.options).map((o) => ({
      candidateId: num(o.candidateId),
      pledgeRank: typeof o.pledgeRank === 'number' ? o.pledgeRank : undefined,
      sourceTitle: typeof o.sourceTitle === 'string' ? o.sourceTitle : undefined,
      blurb: str(o.blurb),
    })),
  }));
}

/** 임의의(불완전할 수 있는) 객체를 안전한 Election으로 정규화 */
export function normalizeElection(raw: unknown): Election {
  const e = (raw ?? {}) as Record<string, unknown>;
  const id = str(e.id, `custom-${Date.now()}`);
  return {
    id,
    order: typeof e.order === 'number' ? e.order : DEFAULT_ORDER,
    meta: normMeta(e.meta, id),
    candidates: arr<unknown>(e.candidates).map(normCandidate),
    bulletinPolicies: normBulletin(e.bulletinPolicies),
    quizThemes: normQuizThemes(e.quizThemes),
  };
}

function isStorageAvailable(): boolean {
  try {
    window.localStorage.setItem('__ce_test__', '1');
    window.localStorage.removeItem('__ce_test__');
    return true;
  } catch {
    return false;
  }
}

/** 저장된 커스텀 선거구 목록 */
export function loadCustomElections(): Election[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeElection).filter((e) => e.candidates.length > 0);
  } catch {
    return [];
  }
}

function persist(list: Election[]): Election[] {
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* 용량 초과 등 무시 */
    }
  }
  return list;
}

/** 같은 id면 교체, 아니면 추가 후 전체 목록 반환 */
export function saveCustomElection(election: Election): Election[] {
  const normalized = normalizeElection(election);
  const others = loadCustomElections().filter((e) => e.id !== normalized.id);
  return persist([...others, normalized]);
}

/** 특정 커스텀 선거구 삭제 */
export function deleteCustomElection(id: string): Election[] {
  return persist(loadCustomElections().filter((e) => e.id !== id));
}
