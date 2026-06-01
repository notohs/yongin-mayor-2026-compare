import type { PledgeCategory } from './types';

/** 퀴즈 선택지 1개 정의 (후보·공약 연결 + 익명 요약) */
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

/** 퀴즈 1문항(테마) 정의 */
export interface QuizThemeDef {
  id: string;
  /** 대표 분야(아이콘·라벨용) */
  category: PledgeCategory;
  /** 사용자에게 보이는 질문 */
  question: string;
  options: QuizOptionDef[];
}

// 비슷한 주제에서 세 후보의 서로 다른 접근을 한 문항으로 묶었다.
// blurb 는 어느 후보인지 알 수 없도록 정책 내용만 중립적으로 요약한다.
export const quizThemes: QuizThemeDef[] = [
  {
    id: 'transport',
    category: 'transport',
    question: '출퇴근과 이동 불편, 어떻게 푸는 방식이 더 끌리나요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 2,
        blurb: '용인분당급행철도 등 광역철도를 새로 깔고 광역버스를 늘려 강남권까지 30분대로 잇겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 2,
        blurb: '광역·도시철도 신설·연장에 도로 확충과 스마트 교통체계까지 더해 교통망을 종합적으로 키우겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 1,
        blurb: '새 노선보다 기존 버스 노선을 재편하고 환승 품질을 높여 “기다림이 덜한” 이동을 만들겠다.',
      },
    ],
  },
  {
    id: 'semiconductor',
    category: 'semiconductor',
    question: '반도체 산업, 시민에게 어떻게 도움이 되게 할까요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 1,
        blurb: '시장 직속 상황실을 만들어 삼성전자 1기 팹 가동을 임기 내로 앞당기겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 1,
        blurb: '인허가를 신속 처리하고 소재·부품·장비·설계기업을 유치해 글로벌 반도체 생태계를 키우겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 3,
        blurb: '반도체 인재양성센터와 산학협력으로 시민이 체감하는 양질의 일자리를 만들겠다.',
      },
    ],
  },
  {
    id: 'economy',
    category: 'economy',
    question: '지역 경제와 상권을 살리는 방법, 무엇이 좋을까요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 5,
        blurb: '5,000억 원 규모 벤처 투자펀드로 청년 창업과 스타트업의 초기 자금을 받쳐주겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 4,
        blurb: '전통시장 현대화와 소상공인 금융·디지털 지원, 청년 창업·로컬푸드로 골목 상권을 키우겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 2,
        blurb: '에버랜드·민속촌과 연계한 복합문화거점으로 관광객 체류를 늘려 지역 상권에 돈이 돌게 하겠다.',
      },
    ],
  },
  {
    id: 'welfare',
    category: 'welfare',
    question: '시민의 일상과 삶의 질, 어떤 정책이 더 마음에 드나요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 3,
        blurb: '태양광 등으로 전력을 생산하는 시 주도 에너지 회사를 세워 “햇빛연금” 형태의 에너지 기본소득을 주겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 3,
        blurb: '생애주기별 맞춤형 돌봄과 생활SOC 확충으로 촘촘한 복지 안전망을 만들겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 5,
        blurb: '층간소음·에너지 기준을 법보다 강화한 친환경 주거 기준으로 관리비를 줄이고 쾌적성을 높이겠다.',
      },
    ],
  },
  {
    id: 'future',
    category: 'urban',
    question: '용인의 미래 경쟁력, 무엇으로 키우는 게 좋을까요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 4,
        blurb: '반도체 배후도시와 경제자유구역을 지정해 글로벌 기업·R&D·국제학교를 유치하겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 5,
        blurb: 'AI·반도체 융합 미래교육과 통학 안전으로 교육을 도시 경쟁력으로 연결하겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 4,
        blurb: '인구 100만 특례시에 걸맞은 행정·재정 권한을 확보하고 구(區) 권한을 키워 자치 역량을 강화하겠다.',
      },
    ],
  },
  // ── 선거공보 세부 공약 기반 문항 ──────────────────────
  // 송창훈은 선거공보 세부 공약이 없어 아래 문항에는 등장하지 않는다(현근택·이상일 2지선다).
  {
    id: 'b-education',
    category: 'education',
    question: '아이들의 교육·보육, 어느 방향이 더 좋을까요?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 교육·보육',
        blurb: '출산지원금을 첫째 100만·둘째 200만 원으로 늘리고, ‘무상에듀버스’와 중학생 ‘씨앗교육펀드’ 100만 원을 지급하겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 교육·보육',
        blurb: 'AI 예술융합고를 설립하고 공공 통학버스와 3개 구 랜드마크 도서관을 만들겠다.',
      },
    ],
  },
  {
    id: 'b-youth',
    category: 'economy',
    question: '청년 지원, 어떤 방식이 더 끌리나요?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 청년',
        blurb: '교통요충지에 청년·신혼 공공임대주택 5,000세대를 공급하고 청년 대중교통 ‘무제한 패스’를 도입하겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 청년',
        blurb: '‘청년 우선 채용 쿼터제’와 ‘10년 1억 자산형성 적금’(월 25만 원), 청년 AI 구독료를 지원하겠다.',
      },
    ],
  },
  {
    id: 'b-market',
    category: 'economy',
    question: '소상공인·골목상권을 살리는 방법은?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 민생경제',
        blurb: '용인사랑상품권 발행을 늘려 골목상권을 살리고, 소상공인 AI 바우처로 창업·재도약을 돕겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 소상공인',
        blurb: '전통시장을 현대화하고 소상공인 대출보증을 1억 원까지 확대하며 권역별 무료 ‘스타트업허브’를 운영하겠다.',
      },
    ],
  },
  {
    id: 'b-senior',
    category: 'welfare',
    question: '어르신·돌봄 복지, 어느 쪽이 더 마음에 드나요?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 복지·돌봄',
        blurb: '‘든든용인 통합돌봄’으로 의료·요양·일상돌봄을 원스톱 연계하고 광역 노인복지센터를 설치하겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 보건·복지',
        blurb: '노인 건강·여가 종합복지단지와 스마트 경로당을 늘리고 65세 이상 마을버스를 무료로 운영하겠다.',
      },
    ],
  },
  {
    id: 'b-env',
    category: 'housing',
    question: '환경·에너지 정책, 어느 쪽이 더 끌리나요?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 에너지·환경',
        blurb: '시가 주도하는 에너지 회사를 세워 ‘햇빛연금’ 형태의 에너지 기본소득을 주고 태양광·바이오가스를 확대하겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 환경·행정',
        blurb: '용인 그린 에코파크와 탄소중립 뱅크를 만들고 노후 건물 에너지 효율화를 지원하겠다.',
      },
    ],
  },
  {
    id: 'b-road',
    category: 'transport',
    question: '도로망 확충, 어느 쪽이 더 끌리나요?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 도로·인프라',
        blurb: '국지도·국도를 확장하고 고속화도로와 나들목(IC)을 늘려 반도체 벨트 연계 도로망을 촘촘히 깔겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 교통(도로)',
        blurb: '제2용서·용인성남·반도체고속도로와 지하 경부고속도로를 신설하고 국도 45호선을 확장하겠다.',
      },
    ],
  },
  {
    id: 'b-culture',
    category: 'culture',
    question: '문화·예술 인프라, 어느 쪽이 더 마음에 드나요?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 문화',
        blurb: '시립미술관과 아트센터를 짓고 기흥호수 음악당과 예술인 기본소득을 도입하겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 문화·체육·관광',
        blurb: '이동읍에 아트홀·시립미술관을 짓고 용인관광재단과 대형 돔 구장을 만들겠다.',
      },
    ],
  },
  {
    id: 'b-admin',
    category: 'urban',
    question: '특례시 행정·운영, 어느 방향이 더 좋을까요?',
    options: [
      {
        candidateId: 1,
        sourceTitle: '선거공보 · 행정',
        blurb: '현행 3개 구를 생활권 중심 4개 구로 개편하고 생활민원을 원스톱으로 처리하겠다.',
      },
      {
        candidateId: 2,
        sourceTitle: '선거공보 · 환경·행정',
        blurb: '150만 광역시를 목표로 분구(최대 5개)를 검토하고 빅데이터 행정 플랫폼을 확대하겠다.',
      },
    ],
  },
];
