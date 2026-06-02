import type { Candidate, CandidateReview } from '../data/types';
import { tallyVerdicts } from '../data/types';
import { formatMoney } from '../utils/format';
import CandidateSummaryCard from './CandidateSummaryCard';
import SectionTitle from './SectionTitle';
import styles from './OverviewView.module.scss';

interface OverviewViewProps {
  candidates: Candidate[];
  pledgeReviews?: Record<number, CandidateReview>;
  source?: string;
}

/** 종합 비교 — 방송 빅보드(전원 동일 비중 타일) + 요약 티커 */
function OverviewView({ candidates, pledgeReviews, source }: OverviewViewProps) {
  const withRecord = candidates.filter((c) => c.criminal.hasRecord).length;
  const withUnsound = candidates.filter((c) => {
    const r = pledgeReviews?.[c.id];
    return r ? tallyVerdicts(r.items).unsound > 0 : false;
  }).length;
  const avgAssets =
    candidates.reduce((sum, c) => sum + c.assets.total, 0) / Math.max(1, candidates.length);

  const tickerItems: { label: string; value: string; tone?: 'positive' | 'danger' }[] = [
    { label: '비교 후보', value: `${candidates.length}명` },
    { label: '전과 보유', value: `${withRecord}명`, tone: withRecord ? 'danger' : 'positive' },
    {
      label: '검증 부적정 보유',
      value: `${withUnsound}명`,
      tone: withUnsound ? 'danger' : 'positive',
    },
    { label: '평균 신고재산', value: formatMoney(Math.round(avgAssets)) },
  ];

  return (
    <div className={styles.OverviewView}>
      <p className={styles.Desc}>
        방송 빅보드 형식으로 후보 전원을 동일 비중·동일 형식으로 한눈에 비교합니다. 배열은
        기호순이며 우열과 무관합니다.
      </p>

      <div className={styles.Ticker}>
        {tickerItems.map((it) => (
          <div className={styles.TickerCell} key={it.label}>
            <span className={styles.TickerLabel}>{it.label}</span>
            <span
              className={`${styles.TickerValue} num`}
              style={{
                color: it.tone
                  ? `var(--${it.tone === 'danger' ? 'danger' : 'pos'}-fg)`
                  : 'var(--text)',
              }}
            >
              {it.value}
            </span>
          </div>
        ))}
      </div>

      <SectionTitle title="후보자 보드" />
      <div className={styles.Board}>
        {candidates.map((candidate) => (
          <CandidateSummaryCard
            key={candidate.id}
            candidate={candidate}
            review={pledgeReviews?.[candidate.id]}
          />
        ))}
      </div>

      <p className={styles.Foot}>
        모든 후보를 동일 형식으로 표시합니다. 배열은 기호순입니다.
        {source ? ` 출처 · ${source}` : ''}
      </p>
    </div>
  );
}

export default OverviewView;
