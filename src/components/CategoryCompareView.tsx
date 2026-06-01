import { useState } from 'react';
import type { BulletinData, Candidate, PledgeCategory } from '../data/types';
import { CATEGORY_META } from '../data/categories';
import CandidateBadge from './CandidateBadge';
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

/** 분야별로 5대 공약 + 선거공보 공약을 후보 3인 나란히 비교 */
function CategoryCompareView({ candidates, bulletinPolicies }: CategoryCompareViewProps) {
  const corePledges = (candidate: Candidate, category: PledgeCategory) =>
    candidate.pledges.filter((pledge) => pledge.category === category);

  const bulletinGroups = (candidate: Candidate, category: PledgeCategory) =>
    (bulletinPolicies[candidate.id]?.groups ?? []).filter((group) => group.category === category);

  const hasContent = (candidate: Candidate, category: PledgeCategory) =>
    corePledges(candidate, category).length > 0 || bulletinGroups(candidate, category).length > 0;

  const availableCategories = CATEGORY_ORDER.filter((category) =>
    candidates.some((candidate) => hasContent(candidate, category)),
  );

  const [active, setActive] = useState<PledgeCategory>(availableCategories[0]);
  const activeCategory = availableCategories.includes(active) ? active : availableCategories[0];

  return (
    <div className={styles.CategoryCompareView}>
      <SectionTitle
        title="분야별 정면 비교"
        description="분야를 고르면 후보별 5대 공약과 선거공보 세부 공약을 나란히 볼 수 있습니다."
      />

      <div className={styles.Chips} role="tablist">
        {availableCategories.map((category) => {
          const meta = CATEGORY_META[category];
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.Chip} ${isActive ? styles.chipActive : ''}`}
              onClick={() => setActive(category)}
            >
              <span aria-hidden>{meta.icon}</span> {meta.label}
            </button>
          );
        })}
      </div>

      <div className={styles.Columns}>
        {candidates.map((candidate) => {
          const core = corePledges(candidate, activeCategory);
          const groups = bulletinGroups(candidate, activeCategory);
          const empty = core.length === 0 && groups.length === 0;
          return (
            <section key={candidate.id} className={styles.Column}>
              <header
                className={styles.ColumnHead}
                style={{ borderTopColor: candidate.partyColor }}
              >
                <CandidateBadge id={candidate.id} color={candidate.partyColor} size="sm" />
                <div className={styles.ColumnHeadText}>
                  <span className={styles.ColumnName}>{candidate.name}</span>
                  <span className={styles.ColumnParty}>{candidate.party}</span>
                </div>
              </header>

              {empty ? (
                <p className={styles.Empty}>이 분야 관련 공약 없음</p>
              ) : (
                <div className={styles.Body}>
                  {core.length > 0 ? (
                    <div className={styles.Block}>
                      <span className={styles.BlockLabel}>5대 공약</span>
                      <ul className={styles.CoreList}>
                        {core.map((pledge) => (
                          <li key={pledge.rank} className={styles.CoreItem}>
                            <span
                              className={styles.CoreBadge}
                              style={{ backgroundColor: candidate.partyColor }}
                            >
                              공약 {pledge.rank}
                            </span>
                            {pledge.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {groups.map((group) => (
                    <div key={group.field} className={styles.Block}>
                      <span className={styles.BlockLabel}>
                        선거공보 · {group.field}
                      </span>
                      <ul className={styles.ItemList}>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryCompareView;
