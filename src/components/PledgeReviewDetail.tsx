import type { PledgeReviewItem } from '../data/types';
import { splitCriterion } from '../data/types';
import styles from './PledgeReviewDetail.module.scss';

function levelTone(level: string): 'good' | 'mid' | 'bad' {
  if (['상', '없음', '구체적'].includes(level)) return 'good';
  if (['하', '의심', '모호'].includes(level)) return 'bad';
  return 'mid';
}

/** 헤더·칩에 붙이는 기추진/재탕 강조 미니 배지 (분리 표시) */
export function RecycleMiniBadges({ review }: { review: PledgeReviewItem }) {
  if (!review.inProgress && !review.recycled) return null;
  return (
    <>
      {review.inProgress ? (
        <span className={`${styles.Mini} ${styles.miniInprogress}`}>🛠 기추진</span>
      ) : null}
      {review.recycled ? <span className={`${styles.Mini} ${styles.miniCopy}`}>📋 재탕</span> : null}
    </>
  );
}

const CRITERIA: { key: 'feasibility' | 'specificity'; label: string }[] = [
  { key: 'feasibility', label: '실현 가능성' },
  { key: 'specificity', label: '구체성' },
];

/** 공약 적정성 상세 본문 — 재활용·기추진 점검(분리·강조) + 평가기준 + 종합 + 패널 */
function PledgeReviewDetail({ review }: { review: PledgeReviewItem }) {
  const hasRecycle = Boolean(review.inProgress || review.recycled);
  return (
    <div className={styles.Detail}>
      {hasRecycle ? (
        <div className={styles.RecycleBox}>
          <span className={styles.RecycleHead}>재활용·기추진 점검</span>
          {review.inProgress ? (
            <div className={`${styles.RecycleItem} ${styles.inprogress}`}>
              <span className={styles.RecycleTag}>🛠 이미 추진·완료</span>
              <span className={styles.RecycleNote}>{review.inProgress}</span>
            </div>
          ) : null}
          {review.recycled ? (
            <div className={`${styles.RecycleItem} ${styles.copy}`}>
              <span className={styles.RecycleTag}>📋 재탕·베끼기</span>
              <span className={styles.RecycleNote}>{review.recycled}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.Criteria}>
        {CRITERIA.map(({ key, label }) => {
          const { level, note } = splitCriterion(review[key]);
          return (
            <div key={key} className={styles.CritRow}>
              <span className={styles.CritLabel}>{label}</span>
              <span className={`${styles.Level} ${styles[levelTone(level)]}`}>{level}</span>
              <span className={styles.CritNote}>{note}</span>
            </div>
          );
        })}
      </div>

      {review.comment ? (
        <p className={styles.Comment}>
          <span className={styles.Tag}>종합</span>
          {review.comment}
        </p>
      ) : null}
      {review.panel ? (
        <p className={styles.Panel}>
          <span className={styles.Tag}>균형패널</span>
          {review.panel}
        </p>
      ) : null}
    </div>
  );
}

export default PledgeReviewDetail;
