import type { BulletinData, Candidate, PledgeCategory } from '../data/types';
import { CATEGORY_META } from '../data/categories';
import CompareGrid, { type CompareRow } from './CompareGrid';
import SectionTitle from './SectionTitle';
import styles from './CategoryCompareView.module.scss';

interface CategoryCompareViewProps {
  candidates: Candidate[];
  bulletinPolicies: Record<number, BulletinData>;
}

const CATEGORY_ORDER: PledgeCategory[] = [
  'transport',
  'semiconductor',
  'economy',
  'welfare',
  'urban',
  'education',
  'culture',
  'housing',
];

/** 분야(행) × 후보(열) 통합 비교 표. 분야별 5대 공약 + 선거공보 세부 공약을 한 화면에 나란히. */
function CategoryCompareView({ candidates, bulletinPolicies }: CategoryCompareViewProps) {
  const corePledges = (candidate: Candidate, category: PledgeCategory) =>
    candidate.pledges.filter((pledge) => pledge.category === category);

  const bulletinGroups = (candidate: Candidate, category: PledgeCategory) =>
    (bulletinPolicies[candidate.id]?.groups ?? []).filter((group) => group.category === category);

  const hasContent = (candidate: Candidate, category: PledgeCategory) =>
    corePledges(candidate, category).length > 0 || bulletinGroups(candidate, category).length > 0;

  const rows: CompareRow[] = CATEGORY_ORDER.filter((category) =>
    candidates.some((candidate) => hasContent(candidate, category)),
  ).map((category) => {
    const meta = CATEGORY_META[category];
    return {
      key: category,
      label: `${meta.icon} ${meta.label}`,
      render: (candidate) => {
        const core = corePledges(candidate, category);
        const groups = bulletinGroups(candidate, category);
        if (core.length === 0 && groups.length === 0) {
          return <span className={styles.Empty}>—</span>;
        }
        return (
          <div className={styles.Cell}>
            {core.map((pledge) => (
              <div key={pledge.rank} className={styles.Pledge}>
                <span
                  className={styles.Badge}
                  style={{ backgroundColor: candidate.partyColor }}
                >
                  공약 {pledge.rank}
                </span>
                <span className={styles.PledgeTitle}>{pledge.title}</span>
              </div>
            ))}
            {groups.map((group) => (
              <div key={group.field} className={styles.Group}>
                <span className={styles.GroupLabel}>선거공보 · {group.field}</span>
                <ul className={styles.ItemList}>
                  {group.items.slice(0, 6).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      },
    };
  });

  return (
    <div className={styles.CategoryCompareView}>
      <SectionTitle
        title="분야별 정면 비교"
        description="분야별로 후보의 5대 공약과 선거공보 세부 공약을 한 표에서 나란히 비교합니다. (가로로 스크롤하면 모든 후보를 볼 수 있어요.)"
      />
      <CompareGrid candidates={candidates} rows={rows} />
    </div>
  );
}

export default CategoryCompareView;
