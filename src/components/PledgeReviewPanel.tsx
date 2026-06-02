import { useState } from 'react';
import type { Candidate, CandidateReview, PledgeReviewItem, ReviewVerdict } from '../data/types';
import { tallyVerdicts } from '../data/types';
import CandidateBadge from './CandidateBadge';
import StatusChip, { type StatusTone } from './StatusChip';
import PledgeReviewDetail from './PledgeReviewDetail';
import styles from './PledgeReviewPanel.module.scss';

interface PledgeReviewPanelProps {
  candidates: Candidate[];
  pledgeReviews?: Record<number, CandidateReview>;
}

const VERDICT: Record<ReviewVerdict, { tone: StatusTone; label: string }> = {
  sound: { tone: 'positive', label: '적정' },
  caution: { tone: 'warning', label: '주의' },
  unsound: { tone: 'danger', label: '부적정' },
};

function StackBar({ tally, total }: { tally: ReturnType<typeof tallyVerdicts>; total: number }) {
  const seg = (n: number, color: string, title: string) =>
    n > 0 ? (
      <div style={{ width: `${(n / Math.max(1, total)) * 100}%`, background: color }} title={title} />
    ) : null;
  return (
    <div className={styles.StackBar}>
      {seg(tally.sound, 'var(--pos-fg)', '적정')}
      {seg(tally.caution, 'var(--warn-fg)', '주의')}
      {seg(tally.unsound, 'var(--danger-fg)', '부적정')}
    </div>
  );
}

function ReviewItem({ item }: { item: PledgeReviewItem }) {
  const [open, setOpen] = useState(false);
  const v = VERDICT[item.verdict];
  return (
    <div className={styles.RevItem} onClick={() => setOpen((o) => !o)}>
      <div className={styles.RevItemTop}>
        <span className={`${styles.RevRank} num`}>{item.rank}</span>
        <span className={styles.RevTitle}>{item.title}</span>
        <span className={`${styles.Tag} ${item.nature === 'commitment' ? styles.commitment : styles.aspiration}`}>
          {item.nature === 'commitment' ? '공약' : '목표'}
        </span>
        <StatusChip tone={v.tone} label={v.label} />
      </div>
      {open ? (
        <div className={styles.RevBody} onClick={(e) => e.stopPropagation()}>
          <PledgeReviewDetail review={item} />
        </div>
      ) : null}
    </div>
  );
}

function ReviewCard({ candidate, review }: { candidate: Candidate; review: CandidateReview }) {
  const tally = tallyVerdicts(review.items);
  return (
    <div className={styles.RevCard}>
      <div className={styles.RevHead}>
        <div className={styles.RevWho}>
          <CandidateBadge id={candidate.id} color={candidate.partyColor} size="md" />
          <span className={styles.RevName}>{candidate.name}</span>
          <span className={styles.RevParty}>{candidate.party}</span>
        </div>
        <div className={styles.RevSrc}>
          검증: {review.reviewer}
          <br />
          출처: {review.source}
        </div>
        <StackBar tally={tally} total={review.items.length} />
        <div className={styles.RevTally}>
          <StatusChip tone="positive" label={`적정 ${tally.sound}`} />
          <StatusChip tone="warning" label={`주의 ${tally.caution}`} />
          <StatusChip tone="danger" label={`부적정 ${tally.unsound}`} />
        </div>
      </div>
      <div className={styles.RevList}>
        {review.items.map((item) => (
          <ReviewItem key={item.rank} item={item} />
        ))}
      </div>
    </div>
  );
}

/** 공약 적정성 교차검증 패널 (인물·검증 화면 하단) */
function PledgeReviewPanel({ candidates, pledgeReviews }: PledgeReviewPanelProps) {
  if (!pledgeReviews) return null;
  const reviewed = candidates.filter((c) => pledgeReviews[c.id]);
  if (reviewed.length === 0) return null;

  return (
    <section className={styles.PledgeReviewPanel}>
      <div className={styles.Sec}>
        <h2 className={styles.SecTitle}>공약 적정성 교차검증</h2>
        <span className={styles.SecMeta}>후보 소속 제외 4개 정당 균형패널</span>
      </div>
      <p className={styles.Desc}>
        각 후보의 5대 공약을 후보 소속을 뺀 4개 정당 ‘균형패널’이 실현가능성·구체성·중복 여부로
        평가한 결과입니다. 항목을 누르면 등급·근거·표결이 펼쳐집니다. 등급(짧은 값)과 근거(설명)는
        분리해 표기하며, ‘연속’은 현직 본인 사업의 지속(긍정), ‘기추진·재탕’은 주의 지표입니다.
        재탕의 방향은 시점이 명확히 앞선 원본이 있을 때만 밝힙니다.
      </p>
      <div className={styles.RevGrid}>
        {reviewed.map((candidate) => (
          <ReviewCard key={candidate.id} candidate={candidate} review={pledgeReviews[candidate.id]} />
        ))}
      </div>
    </section>
  );
}

export default PledgeReviewPanel;
