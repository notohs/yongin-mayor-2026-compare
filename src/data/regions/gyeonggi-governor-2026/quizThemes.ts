import type { QuizThemeDef } from '../../types';

// 비슷한 주제에서 후보별 접근이 다른 지점을 한 문항으로 묶었다. blurb는 후보를 드러내지 않는 중립 요약.
export const quizThemes: QuizThemeDef[] = [
  {
    id: 'transport',
    category: 'transport',
    question: '출퇴근·이동 불편, 어떻게 푸는 방식이 더 끌리나요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 1,
        blurb: 'GTX를 차질 없이 개통하고 수도권 교통패스를 ‘원(One)패스’로 통합해 30분 출근을 만들겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 3,
        blurb: '광역교통망을 확충하고 산업·물류 전용도로 ‘실리콘 하이웨이’와 ‘경기 스테이션+’로 Door-to-Door 교통을 만들겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 2,
        blurb: 'GTX 조기 착공과 강변북로 지하화, 반도체 벨트 광역철도 ‘반도체 익스프레스’로 출퇴근 고통을 줄이겠다.',
      },
    ],
  },
  {
    id: 'semiconductor',
    category: 'semiconductor',
    question: '경기도 미래 먹거리(반도체·첨단산업), 어느 쪽이 끌리나요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 3,
        blurb: '설계부터 생산·소부장·R&D까지 전주기 K-반도체 생태계를 완성하고 ‘경기미래투자공사’를 세우겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 1,
        blurb: '초광역 반도체 클러스터 K-벨트와 규제 완화로 도민 1인당 GRDP 1억원 시대를 열겠다.',
      },
    ],
  },
  {
    id: 'housing',
    category: 'housing',
    question: '주거 문제, 어떤 해법이 좋을까요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 2,
        blurb: '역세권·공공택지에 청년·신혼 공공임대를 집중 공급하고 1기 신도시 재건축을 신속 추진하겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 4,
        blurb: '일자리·주거·문화가 결합된 자족도시 ‘G-타운’과 저렴한 공공임대로 서민 주거를 안정시키겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 1,
        blurb: '전세대란 대응본부를 만들고 규제를 풀어 거주 이전의 자유를 회복하며 자족도시를 실현하겠다.',
      },
      {
        candidateId: 6,
        pledgeRank: 5,
        blurb: '분양주택을 없애고 공공임대만 승인해, 주택을 ‘소유’가 아닌 ‘거주’ 개념으로 바꾸겠다.',
      },
    ],
  },
  {
    id: 'welfare',
    category: 'welfare',
    question: '복지·돌봄, 어느 방향이 마음에 드나요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 4,
        blurb: '‘경기돌봄기준선’과 돌봄 SOC 거점, 공공산후조리원·요양원 확대로 복지 안전망을 강화하겠다.',
      },
      {
        candidateId: 2,
        pledgeRank: 5,
        blurb: '스마트 복지 ‘G-카드’와 거점형 공유보육, 청년 투자 ‘경기 청년패스’로 자립을 돕겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 4,
        blurb: '지방의료원 기능을 강화하고 ‘맘편한 놀이방’·AI 복지알림으로 밀착 공공서비스를 제공하겠다.',
      },
      {
        candidateId: 5,
        pledgeRank: 3,
        blurb: '통합돌봄을 경기도가 직접 책임지고, 돌보는 사람까지 지원하는 돌봄도시를 만들겠다.',
      },
      {
        candidateId: 6,
        pledgeRank: 4,
        blurb: '난임·시험관 등 의료보험 미적용 분야를 전액 무상의료로 지원하겠다.',
      },
    ],
  },
  {
    id: 'economy',
    category: 'economy',
    question: '지역경제·산업, 어느 쪽이 끌리나요?',
    options: [
      {
        candidateId: 4,
        pledgeRank: 3,
        blurb: '규제프리존·경기남부국제공항·방산 클러스터로 권역별 산업을 특화해 첨단경제 거점을 만들겠다.',
      },
      {
        candidateId: 5,
        pledgeRank: 4,
        blurb: '지역의 돈이 지역을 돌게 하는 ‘경기공공은행’을 세워 지역경제 선순환을 만들겠다.',
      },
    ],
  },
  {
    id: 'governance',
    category: 'urban',
    question: '행정·제도 개혁, 어느 쪽이 끌리나요?',
    options: [
      {
        candidateId: 1,
        pledgeRank: 5,
        blurb: '노동감독관 도입과 AI 응급의료·AI 민원 플랫폼으로 안전하고 투명한 혁신행정을 펴겠다.',
      },
      {
        candidateId: 4,
        pledgeRank: 5,
        blurb: '도민 실생활에 밀착한 시민 맞춤형 공공서비스로 복지의 질을 바꾸겠다.',
      },
      {
        candidateId: 6,
        pledgeRank: 1,
        blurb: '유권자 10% 서명으로 법률·조례를 재심의하는 ‘국민발의제’로 직접민주주의를 강화하겠다.',
      },
    ],
  },
];
