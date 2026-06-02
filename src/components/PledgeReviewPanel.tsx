import type { Candidate, CandidateReview, ReviewVerdict } from '../data/types';
import CandidateBadge from './CandidateBadge';
import SectionTitle from './SectionTitle';
import styles from './PledgeReviewPanel.module.scss';

interface PledgeReviewPanelProps {
  candidates: Candidate[];
  pledgeReviews?: Record<number, CandidateReview>;
}

const VERDICT_LABEL: Record<ReviewVerdict, string> = {
  sound: '적정',
  caution: '주의',
  unsound: '부적정',
};

/** 공약 적정성 교차검증 결과 패널 (인물·검증 화면 하단) */
function PledgeReviewPanel({ candidates, pledgeReviews }: PledgeReviewPanelProps) {
  if (!pledgeReviews) return null;
  const reviewed = candidates.filter((c) => pledgeReviews[c.id]);
  if (reviewed.length === 0) return null;

  return (
    <section className={styles.PledgeReviewPanel}>
      <SectionTitle
        title="공약 적정성 교차검증"
        description="각 후보의 5대 공약을 다른 정당 검증단이 ①실현 가능성 ②이미 완료·베끼기 여부 ③구체성 3가지 기준으로 교차 평가한 결과입니다. 참고용 의견이며, 최종 판단은 유권자의 몫입니다."
      />
      <div className={styles.Grid}>
        {reviewed.map((candidate) => {
          const review = pledgeReviews[candidate.id];
          return (
            <article key={candidate.id} className={styles.Card}>
              <header className={styles.Head}>
                <CandidateBadge id={candidate.id} color={candidate.partyColor} size="sm" />
                <div className={styles.HeadName}>
                  <strong>{candidate.name}</strong>
                  <span className={styles.Reviewer}>검증: {review.reviewer}</span>
                </div>
                <div className={styles.Tally}>
                  <span className={`${styles.TallyChip} ${styles.sound}`}>적정 {review.sound}</span>
                  <span className={`${styles.TallyChip} ${styles.caution}`}>주의 {review.caution}</span>
                  <span className={`${styles.TallyChip} ${styles.unsound}`}>부적정 {review.unsound}</span>
                </div>
              </header>

              <ul className={styles.Items}>
                {review.items.map((item) => (
                  <li key={item.rank} className={`${styles.Item} ${styles[item.verdict]}`}>
                    <div className={styles.ItemTop}>
                      <span className={styles.Rank}>공약 {item.rank}</span>
                      <span className={styles.ItemTitle}>{item.title}</span>
                      <span className={`${styles.Verdict} ${styles[item.verdict]}`}>
                        {VERDICT_LABEL[item.verdict]}
                      </span>
                    </div>
                    <dl className={styles.Criteria}>
                      <div>
                        <dt>실현 가능성</dt>
                        <dd>{item.feasibility}</dd>
                      </div>
                      <div>
                        <dt>완료·중복</dt>
                        <dd>{item.duplication}</dd>
                      </div>
                      <div>
                        <dt>구체성</dt>
                        <dd>{item.specificity}</dd>
                      </div>
                    </dl>
                    {item.comment ? <p className={styles.Comment}>{item.comment}</p> : null}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default PledgeReviewPanel;
