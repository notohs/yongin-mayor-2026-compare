import type { Candidate, Election, Pledge, PledgeCategory } from '../data/types';

// 알려진 정당명(긴 이름 우선) — OCR/표 텍스트에서 후보를 anchor 하는 데 사용
const PARTIES = [
  '더불어민주당',
  '국민의힘',
  '개혁신당',
  '조국혁신당',
  '새로운미래',
  '기본소득당',
  '자유통일당',
  '녹색정의당',
  '정의당',
  '진보당',
  '무소속',
];

const PARTY_COLORS: Record<string, string> = {
  더불어민주당: '#152484',
  국민의힘: '#e61e2b',
  개혁신당: '#ff7210',
  조국혁신당: '#0073cf',
  새로운미래: '#00b3e6',
  기본소득당: '#00d2c3',
  정의당: '#ffed00',
  진보당: '#d6001c',
  무소속: '#64748b',
};

const partyColor = (party: string): string => PARTY_COLORS[party] ?? '#64748b';
const cleanParty = (s: string): string =>
  PARTIES.find((p) => s.includes(p) || p.includes(s)) ?? s.trim();

/** 공약 제목 키워드로 분야 추정 */
function categoryFromText(t: string): PledgeCategory {
  const has = (...ks: string[]) => ks.some((k) => t.includes(k));
  if (has('교통', '철도', '도로', '버스', '지하철', '환승', '광역')) return 'transport';
  if (has('반도체')) return 'semiconductor';
  if (has('복지', '돌봄', '어르신', '노인', '출산', '아동', '건강', '의료')) return 'welfare';
  if (has('교육', '학교', '학생', '보육')) return 'education';
  if (has('문화', '관광', '예술', '체육', '축제')) return 'culture';
  if (has('주거', '주택', '환경', '에너지', '탄소', '기후')) return 'housing';
  if (has('행정', '특례시', '자치', '도시', '개발', '권한', '분구')) return 'urban';
  return 'economy';
}

/** 선거명/지역 추정 */
function guessRegion(text: string): string {
  const patterns = [
    /([가-힣]+특별자치시장|[가-힣]+특례시장|[가-힣]+시장)\s*선거/,
    /([가-힣]+교육감)\s*선거/,
    /([가-힣]+특별자치도지사|[가-힣]+도지사)\s*선거/,
    /([가-힣]+군수|[가-힣]+구청장)\s*선거/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1];
  }
  return '';
}

interface Detected {
  id?: number;
  name?: string;
  party?: string;
}

/** 한 파일(=한 후보 자료) 텍스트에서 후보 식별 */
function detectCandidate(text: string): Detected {
  let m = text.match(
    /후보자\s*명?\s*[:：]?\s*([가-힣]{2,5})\s*기호\s*[:：]?\s*(\d{1,2})\s*소속정당\s*명?\s*[:：]?\s*([가-힣]+)/,
  );
  if (m) return { name: m[1], id: Number(m[2]), party: cleanParty(m[3]) };

  m = text.match(
    /기호\s*[:：]?\s*(\d{1,2})\s*소속정당\s*명?\s*[:：]?\s*([가-힣]+)\s*후보자\s*성?명?\s*[:：]?\s*([가-힣]{2,5})/,
  );
  if (m) return { id: Number(m[1]), party: cleanParty(m[2]), name: m[3] };

  // 정당명 anchor + 후보자정보공개자료 표 행("<기호> <정당> <성명>") + 기호 숫자
  const party = PARTIES.find((p) => text.includes(p));
  const idMatch = text.match(/기호\s*[:：]?\s*(\d{1,2})\b/);
  let id = idMatch ? Number(idMatch[1]) : undefined;
  let name: string | undefined;
  if (party) {
    const row = text.match(new RegExp(`(\\d{1,2})\\s+${party}\\s+([가-힣]{2,5})`));
    if (row) {
      id = id ?? Number(row[1]);
      name = row[2];
    }
  }
  return { id, name, party: party ? cleanParty(party) : undefined };
}

/** 공약 제목들 추출('제목 : ...' 라인) */
function extractPledges(text: string): Pledge[] {
  const titles: string[] = [];
  for (const m of text.matchAll(/제목\s*[:：]\s*([^\n]+)/g)) {
    const title = m[1].trim().replace(/\s+/g, ' ');
    if (title.length >= 4 && title.length <= 60 && !titles.includes(title)) titles.push(title);
  }
  return titles.slice(0, 8).map((title, i) => ({
    rank: i + 1,
    title,
    category: categoryFromText(title),
    goals: [],
    methods: [],
    period: [],
    funding: [],
  }));
}

/** 생년월일·나이·학력 best-effort 추출 */
function extractProfile(text: string): { birth?: string; age?: number; education?: string } {
  const out: { birth?: string; age?: number; education?: string } = {};
  const bd = text.match(
    /((?:19|20)\d{2})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})\.?\s*\(\s*만?\s*(\d{1,2})\s*세/,
  );
  if (bd) {
    out.birth = `${bd[1]}.${bd[2].padStart(2, '0')}.${bd[3].padStart(2, '0')}`;
    out.age = Number(bd[4]);
  }
  const edu = text.match(/([가-힣]{2,15}대학교[^\n]{0,25}?졸업)/);
  if (edu) out.education = edu[1].trim().replace(/\s+/g, ' ');
  return out;
}

function emptyCandidate(id: number): Candidate {
  return {
    id,
    name: `기호 ${id}`,
    party: '미상',
    partyColor: '#64748b',
    slogan: '',
    vision: '',
    birth: '',
    age: 0,
    gender: '',
    job: '',
    education: '',
    careers: [],
    poster: '',
    pledges: [],
    criminal: { hasRecord: false, items: [] },
    tax: { totalPaid: 0, candidatePaid: 0, currentArrears: 0, hasArrearsRecord: false },
    military: { candidate: '', completed: true, dependentCompleted: null },
    assets: { total: 0, candidate: 0, spouse: null, breakdown: '' },
    materials: { bulletin: true, pledgeBook: true, fivePledges: true },
  };
}

/**
 * 추출 텍스트(파일별)에서 선거구 초안(Election)을 best-effort로 만든다.
 * 각 PDF를 한 후보의 자료로 보고 후보를 식별한 뒤 공약 제목·생년월일·학력을 채운다.
 * (이미지 OCR은 누락·오탈자가 있을 수 있어, 빈 항목은 사용자가 보완해야 한다.)
 */
export function buildDraftElection(texts: string[], regionName?: string): Election {
  const all = texts.join('\n');
  const region = (regionName && regionName.trim()) || guessRegion(all) || '○○선거';

  const byId = new Map<number, Candidate>();
  let autoId = 1000; // 기호를 못 찾은 후보 임시 키

  for (const text of texts) {
    const det = detectCandidate(text);
    if (det.id === undefined && !det.name) continue; // 후보를 식별 못한 파일은 건너뜀

    const key = det.id ?? autoId++;
    const candidate = byId.get(key) ?? emptyCandidate(key);
    if (det.name) candidate.name = det.name;
    if (det.party) {
      candidate.party = det.party;
      candidate.partyColor = partyColor(det.party);
    }

    const profile = extractProfile(text);
    if (profile.birth && !candidate.birth) candidate.birth = profile.birth;
    if (profile.age && !candidate.age) candidate.age = profile.age;
    if (profile.education && !candidate.education) candidate.education = profile.education;

    const pledges = extractPledges(text);
    if (pledges.length > candidate.pledges.length) candidate.pledges = pledges;

    byId.set(key, candidate);
  }

  const candidates = [...byId.values()].sort((a, b) => a.id - b.id);
  const id = `custom-${region.replace(/[^가-힣A-Za-z0-9]/g, '') || 'region'}-${new Date().getFullYear()}`;

  return {
    id,
    order: 50,
    meta: {
      region,
      title: `${region} 후보 비교`,
      subtitle: '관리자 콘솔 업로드 데이터',
      note: '선거공보 등 업로드 자료에서 추출한 초안입니다. 빈 항목은 검토·보완이 필요합니다.',
      source: '후보자 제출 선거공보 등',
    },
    candidates,
    bulletinPolicies: {},
    quizThemes: [],
  };
}
