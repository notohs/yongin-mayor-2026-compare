import type { Candidate, CandidateReview } from '../data/types';
import { tallyVerdicts } from '../data/types';
import { formatMoney } from '../utils/format';
import type { StatusTone } from './StatusChip';
import CandidateBadge from './CandidateBadge';
import styles from './CandidateSummaryCard.module.scss';

interface CandidateSummaryCardProps {
  candidate: Candidate;
  /** 공약 적정성 교차검증 결과(있으면 검증 요약) */
  review?: CandidateReview;
}

const GLYPH: Record<StatusTone, string> = {
  positive: '✓',
  danger: '✕',
  warning: '!',
  neutral: '',
};

function StatRow({ label, value, tone }: { label: string; value: string; tone?: StatusTone }) {
  const glyph = tone ? GLYPH[tone] : '';
  const color = tone ? `var(--${tone === 'positive' ? 'pos' : tone === 'danger' ? 'danger' : 'warn'}-fg)` : 'var(--text)';
  return (
    <div className={styles.StatRow}>
      <span className={styles.StatLabel}>{label}</span>
      <span className={`${styles.StatValue} num`} style={{ color }}>
        {glyph ? <span aria-hidden="true">{glyph}</span> : null}
        {value}
      </span>
    </div>
  );
}

/** 종합 비교 보드의 후보 타일 — 포스터 전체 노출(contain) + 정당 series bar + 지표 행 */
function CandidateSummaryCard({ candidate, review }: CandidateSummaryCardProps) {
  const { criminal, assets, tax, materials } = candidate;
  const haveMaterials = [materials.bulletin, materials.pledgeBook, materials.fivePledges].filter(
    Boolean,
  ).length;
  const taxRate = assets.total > 0 ? ((tax.totalPaid - tax.currentArrears) / assets.total) * 100 : null;

  const reviewStat = (): { label: string; tone: StatusTone } => {
    if (!review) return { label: '자료 없음', tone: 'neutral' };
    const t = tallyVerdicts(review.items);
    if (t.unsound > 0) return { label: `부적정 ${t.unsound}`, tone: 'danger' };
    if (t.caution > 0) return { label: `주의 ${t.caution}`, tone: 'warning' };
    return { label: '전부 적정', tone: 'positive' };
  };
  const rv = reviewStat();

  return (
    <article className={styles.Tile}>
      <div className={styles.Series} style={{ background: candidate.partyColor }} />
      <div className={styles.PosterWrap}>
        <img
          className={styles.Poster}
          src={candidate.poster}
          alt={`${candidate.name} 후보 선거공보 표지`}
          loading="lazy"
        />
      </div>
      <div className={styles.Body}>
        <div className={styles.PartyRow}>
          <CandidateBadge id={candidate.id} color={candidate.partyColor} size="md" />
          <span className={styles.Party}>{candidate.party}</span>
        </div>
        <div className={styles.Name}>{candidate.name}</div>
        <p className={styles.Slogan}>“{candidate.slogan}”</p>

        <div className={styles.Stats}>
          <StatRow
            label="전과"
            value={criminal.hasRecord ? `${criminal.items.length}건` : '없음'}
            tone={criminal.hasRecord ? 'danger' : 'positive'}
          />
          <StatRow label="신고재산" value={formatMoney(assets.total)} />
          <StatRow label="납세율" value={taxRate === null ? '산정 불가' : `${taxRate.toFixed(2)}%`} />
          <StatRow label="공약검증" value={rv.label} tone={rv.tone} />
          <StatRow
            label="자료제출"
            value={`${haveMaterials}/3 등록`}
            tone={haveMaterials === 3 ? 'positive' : 'warning'}
          />
        </div>
      </div>
    </article>
  );
}

export default CandidateSummaryCard;
