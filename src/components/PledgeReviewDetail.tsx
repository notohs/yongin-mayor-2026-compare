import type { PledgeReviewItem } from '../data/types';
import { splitCriterion } from '../data/types';
import styles from './PledgeReviewDetail.module.scss';

function gradeLevel(level: string): 'high' | 'mid' | 'low' {
  if (/상|구체적|없음/.test(level)) return 'high';
  if (/하|모호|의심/.test(level)) return 'low';
  return 'mid';
}

/** 헤더·칩에 붙이는 연속/기추진/재탕 미니 배지 (레거시 호환용 export) */
export function RecycleMiniBadges({ review }: { review: PledgeReviewItem }) {
  if (!review.continuity && !review.inProgress && !review.recycled) return null;
  return (
    <>
      {review.continuity ? <span className={`${styles.Mini} ${styles.miniContinuity}`}>연속</span> : null}
      {review.inProgress ? <span className={`${styles.Mini} ${styles.miniInprogress}`}>기추진</span> : null}
      {review.recycled ? <span className={`${styles.Mini} ${styles.miniCopy}`}>재탕</span> : null}
    </>
  );
}

function RecycleBox({
  kind,
  text,
}: {
  kind: 'continuity' | 'inProgress' | 'recycled';
  text: string;
}) {
  const meta =
    kind === 'continuity'
      ? { tone: styles.posTone, glyph: '✓', label: '연속·완수(긍정)' }
      : kind === 'inProgress'
        ? { tone: styles.warnTone, glyph: '!', label: '기추진 편승(주의)' }
        : { tone: styles.warnTone, glyph: '!', label: '재탕·중복(주의)' };
  return (
    <div className={styles.Recycle}>
      <span className={`${styles.RecycleHead} ${meta.tone}`}>
        <span aria-hidden="true">{meta.glyph}</span>
        {meta.label}
      </span>
      <div className={styles.RecycleText}>{text}</div>
    </div>
  );
}

function GradeLine({ label, value }: { label: string; value: string }) {
  const { level, note } = splitCriterion(value);
  return (
    <div className={styles.GradeLine}>
      <span className={styles.GradeKey}>{label}</span>
      {level ? <span className={`${styles.Grade} ${styles[gradeLevel(level)]}`}>{level}</span> : null}
      <span className={styles.GradeNote}>{note}</span>
    </div>
  );
}

/** 공약 적정성 상세 — 연속성·재활용 점검 + 등급/근거 분리 + 종합 + 균형패널 */
function PledgeReviewDetail({ review }: { review: PledgeReviewItem }) {
  return (
    <div className={styles.ReviewBox}>
      {review.continuity ? <RecycleBox kind="continuity" text={review.continuity} /> : null}
      {review.inProgress ? <RecycleBox kind="inProgress" text={review.inProgress} /> : null}
      {review.recycled ? <RecycleBox kind="recycled" text={review.recycled} /> : null}

      <GradeLine label="실현가능성" value={review.feasibility} />
      <GradeLine label="구체성" value={review.specificity} />
      {review.comment ? (
        <div className={styles.GradeLine}>
          <span className={styles.GradeKey}>종합 사유</span>
          <span className={styles.GradeNote}>{review.comment}</span>
        </div>
      ) : null}
      {review.panel ? <span className={styles.PanelVote}>균형패널 표결 · {review.panel}</span> : null}
    </div>
  );
}

export default PledgeReviewDetail;
