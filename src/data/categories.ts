import type { PledgeCategory } from './types';

export interface CategoryMeta {
  key: PledgeCategory;
  label: string;
  /** 카테고리 식별용 이모지 아이콘 */
  icon: string;
}

/** 공약 분야별 표시 메타데이터 */
export const CATEGORY_META: Record<PledgeCategory, CategoryMeta> = {
  transport: { key: 'transport', label: '교통', icon: '🚆' },
  semiconductor: { key: 'semiconductor', label: '반도체·미래산업', icon: '🔬' },
  economy: { key: 'economy', label: '경제·일자리', icon: '💼' },
  welfare: { key: 'welfare', label: '복지·생활', icon: '🤝' },
  urban: { key: 'urban', label: '도시·개발', icon: '🏙️' },
  education: { key: 'education', label: '교육', icon: '📚' },
  culture: { key: 'culture', label: '문화·관광', icon: '🎭' },
  housing: { key: 'housing', label: '주거·환경', icon: '🏡' },
};
