import type { Candidate, CandidateReview, ReviewVerdict } from '../data/types';
import { tallyVerdicts } from '../data/types';
import CandidateBadge from './CandidateBadge';
import SectionTitle from './SectionTitle';
import PledgeReviewDetail, { RecycleMiniBadges } from './PledgeReviewDetail';
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
        description="편향을 막기 위해 각 후보의 5대 공약을 ‘후보 소속을 제외한 4개 정당 균형패널’이 실현 가능성·구체성으로 평가하고 다수결로 판정했습니다. ‘공약’(임기 내 이행 약속)과 ‘목표’(장기 지향·초석)는 다른 기준으로 봅니다. 🛠 기추진(이미 추진·완료)과 📋 재탕(타·과거 후보 베끼기)은 구분해 표시합니다. 참고용이며 최종 판단은 유권자의 몫입니다."
      />
      <div className={styles.Grid}>
        {reviewed.map((candidate) => {
          const review = pledgeReviews[candidate.id];
          const tally = tallyVerdicts(review.items);
          return (
            <article key={candidate.id} className={styles.Card}>
              <header className={styles.Head}>
                <CandidateBadge id={candidate.id} color={candidate.partyColor} size="sm" />
                <div className={styles.HeadName}>
                  <strong>{candidate.name}</strong>
                  <span className={styles.Reviewer}>
                    검증 {review.reviewer} · 출처 {review.source}
                  </span>
                </div>
                <div className={styles.Tally}>
                  <span className={`${styles.TallyChip} ${styles.good}`}>적정 {tally.sound}</span>
                  <span className={`${styles.TallyChip} ${styles.mid}`}>주의 {tally.caution}</span>
                  <span className={`${styles.TallyChip} ${styles.bad}`}>부적정 {tally.unsound}</span>
                </div>
              </header>

              <ul className={styles.Items}>
                {review.items.map((item) => (
                  <li key={item.rank} className={styles.Item}>
                    <div className={styles.ItemTop}>
                      <span className={styles.Rank}>공약 {item.rank}</span>
                      <span
                        className={`${styles.Nature} ${
                          item.nature === 'commitment' ? styles.commitment : styles.aspiration
                        }`}
                      >
                        {item.nature === 'commitment' ? '공약' : '목표'}
                      </span>
                      <span className={styles.ItemTitle}>{item.title}</span>
                      <RecycleMiniBadges review={item} />
                      <span className={`${styles.Verdict} ${styles[item.verdict]}`}>
                        {VERDICT_LABEL[item.verdict]}
                      </span>
                    </div>
                    <PledgeReviewDetail review={item} />
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
