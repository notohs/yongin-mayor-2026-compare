import { Fragment, type ReactNode } from 'react';
import type { Candidate } from '../data/types';
import CandidateBadge from './CandidateBadge';
import styles from './CompareGrid.module.scss';

export interface CompareRow {
  key: string;
  label: string;
  render: (candidate: Candidate) => ReactNode;
}

interface CompareGridProps {
  candidates: Candidate[];
  rows: CompareRow[];
}

/** 후보를 열로, 비교 항목을 행으로 나란히 보여주는 범용 비교 표 */
function CompareGrid({ candidates, rows }: CompareGridProps) {
  const columnTemplate = `minmax(92px, 128px) repeat(${candidates.length}, minmax(180px, 1fr))`;

  return (
    <div className={styles.Scroll}>
      <div
        className={styles.CompareGrid}
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div className={`${styles.Cell} ${styles.cornerCell}`} />
        {candidates.map((candidate) => (
          <div key={candidate.id} className={`${styles.Cell} ${styles.headCell}`}>
            <CandidateBadge id={candidate.id} color={candidate.partyColor} size="sm" />
            <span className={styles.HeadName}>{candidate.name}</span>
            <span className={styles.HeadParty}>{candidate.party}</span>
          </div>
        ))}

        {rows.map((row, rowIndex) => {
          const stripe = rowIndex % 2 === 1 ? styles.stripe : '';
          return (
            <Fragment key={row.key}>
              <div className={`${styles.Cell} ${styles.labelCell} ${stripe}`}>
                {row.label}
              </div>
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`${styles.Cell} ${styles.dataCell} ${stripe}`}
                >
                  {row.render(candidate)}
                </div>
              ))}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default CompareGrid;
