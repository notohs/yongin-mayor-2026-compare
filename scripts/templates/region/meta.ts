import type { ElectionMeta } from '../../types';

// 이 선거구의 메타 정보. region 은 헤더 지역 선택기에 표시됩니다.
export const meta: ElectionMeta = {
  region: '○○시장', // 예: '성남시장'
  title: '○○시장 후보 비교',
  subtitle: '제9회 전국동시지방선거 · 2026',
  note: '공약·인적사항은 후보자가 제출한 선거공보 및 후보자정보공개자료를 그대로 정리한 것입니다.',
  source: '중앙선거관리위원회 후보자정보공개자료 · 후보자 공약',
};
