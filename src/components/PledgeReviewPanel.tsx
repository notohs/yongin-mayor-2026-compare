import type { Candidate, CandidateReview, ReviewVerdict } from '../data/types';
import { splitCriterion, tallyVerdicts } from '../data/types';
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

/** 평가 등급(상/중/하·없음/의심·구체적/보통/모호)을 색 톤으로 분류 */
function levelTone(level: string): 'good' | 'mid' | 'bad' {
  if (['상', '없음', '구체적'].includes(level)) return 'good';
  if (['하', '의심', '모호'].includes(level)) return 'bad';
  return 'mid';
}

const CRITERIA: { key: 'feasibility' | 'duplication' | 'specificity'; label: string }[] = [
  { key: 'feasibility', label: '실현 가능성' },
  { key: 'duplication', label: '완료·중복' },
  { key: 'specificity', label: '구체성' },
];

/** 공약 적정성 교차검증 결과 패널 (인물·검증 화면 하단) */
function PledgeReviewPanel({ candidates, pledgeReviews }: PledgeReviewPanelProps) {
  if (!pledgeReviews) return null;
  const reviewed = candidates.filter((c) => pledgeReviews[c.id]);
  if (reviewed.length === 0) return null;

  return (
    <section className={styles.PledgeReviewPanel}>
      <SectionTitle
        title="공약 적정성 교차검증"
        description="각 후보의 5대 공약을 다른 정당 검증단이 ①실현 가능성 ②이미 완료·베끼기 여부 ③구체성으로 평가하고, 해당 정당의 반론을 다시 다른 정당이 재심한 결과입니다. ‘공약’(임기 내 이행 약속)과 ‘목표’(장기 지향·초석)는 다른 기준으로 봅니다. 참고용 의견이며 최종 판단은 유권자의 몫입니다."
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
                      <span className={`${styles.Verdict} ${styles[item.verdict]}`}>
                        {VERDICT_LABEL[item.verdict]}
                      </span>
                    </div>

                    <div className={styles.Criteria}>
                      {CRITERIA.map(({ key, label }) => {
                        const { level, note } = splitCriterion(item[key]);
                        return (
                          <div key={key} className={styles.CritRow}>
                            <span className={styles.CritLabel}>{label}</span>
                            <span className={`${styles.Level} ${styles[levelTone(level)]}`}>
                              {level}
                            </span>
                            <span className={styles.CritNote}>{note}</span>
                          </div>
                        );
                      })}
                    </div>

                    {item.comment ? (
                      <p className={styles.Comment}>
                        <span className={styles.CommentTag}>종합</span> {item.comment}
                      </p>
                    ) : null}
                    {item.rebuttal ? (
                      <p className={styles.Rebuttal}>
                        <span className={styles.RebuttalTag}>반론·재심</span> {item.rebuttal}
                      </p>
                    ) : null}
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
