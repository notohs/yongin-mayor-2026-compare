import { useState } from 'react';
import type { BulletinData, Candidate } from '../data/types';
import CategoryCompareView from './CategoryCompareView';
import PledgeBoard from './PledgeBoard';
import styles from './PledgesTab.module.scss';

interface PledgesTabProps {
  candidates: Candidate[];
  bulletinPolicies: Record<number, BulletinData>;
}

type Mode = 'category' | 'candidate';

const MODES: { key: Mode; label: string }[] = [
  { key: 'category', label: '분야별 비교' },
  { key: 'candidate', label: '후보별 공약' },
];

/** 공약 비교 탭: 분야별 정면 비교 ↔ 후보별 5대 공약 전환 */
function PledgesTab({ candidates, bulletinPolicies }: PledgesTabProps) {
  const [mode, setMode] = useState<Mode>('category');

  return (
    <div className={styles.PledgesTab}>
      <div className={styles.Toggle} role="tablist">
        {MODES.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={mode === item.key}
            className={`${styles.ToggleButton} ${mode === item.key ? styles.active : ''}`}
            onClick={() => setMode(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === 'category' ? (
        <CategoryCompareView candidates={candidates} bulletinPolicies={bulletinPolicies} />
      ) : (
        <PledgeBoard candidates={candidates} />
      )}
    </div>
  );
}

export default PledgesTab;
