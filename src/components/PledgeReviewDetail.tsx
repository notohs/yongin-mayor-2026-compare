import type { PledgeReviewItem } from '../data/types';
import { splitCriterion } from '../data/types';
import styles from './PledgeReviewDetail.module.scss';

function levelTone(level: string): 'good' | 'mid' | 'bad' {
  if (['상', '없음', '구체적'].includes(level)) return 'good';
  if (['하', '의심', '모호'].includes(level)) return 'bad';
  return 'mid';
}

/** 헤더·칩에 붙이는 연속(긍정)/기추진·재탕(주의) 강조 미니 배지 (분리 표시) */
export function RecycleMiniBadges({ review }: { review: PledgeReviewItem }) {
  if (!review.continuity && !review.inProgress && !review.recycled) return null;
  return (
    <>
      {review.continuity ? (
        <span className={`${styles.Mini} ${styles.miniContinuity}`}>연속</span>
      ) : null}
      {review.inProgress ? (
        <span className={`${styles.Mini} ${styles.miniInprogress}`}>기추진</span>
      ) : null}
      {review.recycled ? <span className={`${styles.Mini} ${styles.miniCopy}`}>재탕</span> : null}
    </>
  );
}

const CRITERIA: { key: 'feasibility' | 'specificity'; label: string }[] = [
  { key: 'feasibility', label: '실현 가능성' },
  { key: 'specificity', label: '구체성' },
];

/** 공약 적정성 상세 본문 — 재활용·기추진 점검(분리·강조) + 평가기준 + 종합 + 패널 */
function PledgeReviewDetail({ review }: { review: PledgeReviewItem }) {
  const hasFlags = Boolean(review.continuity || review.inProgress || review.recycled);
  return (
    <div className={styles.Detail}>
      {hasFlags ? (
        <div className={styles.RecycleBox}>
          <span className={styles.RecycleHead}>공약 연속성·재활용 점검</span>
          {review.continuity ? (
            <div className={`${styles.RecycleItem} ${styles.continuity}`}>
              <span className={styles.RecycleTag}>연속·완수</span>
              <span className={styles.RecycleNote}>{review.continuity}</span>
            </div>
          ) : null}
          {review.inProgress ? (
            <div className={`${styles.RecycleItem} ${styles.inprogress}`}>
              <span className={styles.RecycleTag}>이미 추진 중(편승)</span>
              <span className={styles.RecycleNote}>{review.inProgress}</span>
            </div>
          ) : null}
          {review.recycled ? (
            <div className={`${styles.RecycleItem} ${styles.copy}`}>
              <span className={styles.RecycleTag}>재탕·베끼기</span>
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
