import type { Candidate, Election } from '../data/types';

// 정당명 → 대표색 (추정용; 모르면 회색)
const PARTY_COLORS: Record<string, string> = {
  더불어민주당: '#152484',
  국민의힘: '#e61e2b',
  개혁신당: '#ff7210',
  정의당: '#ffed00',
  진보당: '#d6001c',
  새로운미래: '#00b3e6',
  기본소득당: '#00d2c3',
  무소속: '#64748b',
};

const partyColor = (party: string): string => PARTY_COLORS[party] ?? '#64748b';

/** 선거명/지역 추정 */
function guessRegion(text: string): string {
  const patterns = [
    /([가-힣]+특별자치시장|[가-힣]+특례시장|[가-힣]+시장)\s*선거/,
    /([가-힣]+교육감)\s*선거/,
    /([가-힣]+도지사|[가-힣]+특별자치도지사)\s*선거/,
    /([가-힣]+군수|[가-힣]+구청장)\s*선거/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1];
  }
  return '';
}

/** '후보자명 X 기호 N 소속정당명 Y' 류 패턴에서 후보 추출 */
function guessCandidates(text: string): Candidate[] {
  const found = new Map<number, { name: string; party: string }>();

  const reList = [
    /후보자\s*명?\s*[:：]?\s*([가-힣]{2,5})\s*기호\s*[:：]?\s*(\d+)\s*소속정당\s*명?\s*[:：]?\s*([가-힣A-Za-z·]+)/g,
    /기호\s*[:：]?\s*(\d+)\s*소속정당\s*명?\s*[:：]?\s*([가-힣A-Za-z·]+)\s*후보자\s*성?명?\s*[:：]?\s*([가-힣]{2,5})/g,
  ];

  // 패턴 1: 이름, 기호, 정당
  for (const m of text.matchAll(reList[0])) {
    const id = Number(m[2]);
    if (!found.has(id)) found.set(id, { name: m[1], party: m[3] });
  }
  // 패턴 2: 기호, 정당, 이름
  for (const m of text.matchAll(reList[1])) {
    const id = Number(m[1]);
    if (!found.has(id)) found.set(id, { name: m[3], party: m[2] });
  }

  return [...found.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, { name, party }]) => ({
      id,
      name,
      party,
      partyColor: partyColor(party),
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
      // 자료 제출 현황: 기본 제출(true). 미등록 후보는 콘솔에서 false로 바꿔주세요.
      materials: { bulletin: true, pledgeBook: true, fivePledges: true },
    }));
}

/**
 * 추출 텍스트에서 선거구 초안(Election)을 best-effort로 만든다.
 * 선거구명(regionName)이 주어지면 그대로 쓰고, 없으면 텍스트에서 추정한다.
 * 후보(기호/이름/정당)는 자동 추정하고, 나머지 상세는 사용자가 채운다.
 */
export function buildDraftElection(texts: string[], regionName?: string): Election {
  const all = texts.join('\n');
  const region = (regionName && regionName.trim()) || guessRegion(all) || '○○선거';
  const candidates = guessCandidates(all);
  const id = `custom-${region.replace(/[^가-힣A-Za-z0-9]/g, '') || 'region'}-${new Date().getFullYear()}`;

  return {
    id,
    order: 50,
    meta: {
      region,
      title: `${region} 후보 비교`,
      subtitle: '관리자 콘솔 업로드 데이터',
      note: '선거공보 등 업로드 자료에서 추출한 초안입니다. 상세 항목은 검토·보완이 필요합니다.',
      source: '후보자 제출 선거공보 등',
    },
    candidates,
    bulletinPolicies: {},
    quizThemes: [],
  };
}
