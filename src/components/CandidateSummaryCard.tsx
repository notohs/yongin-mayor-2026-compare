import type { Candidate } from '../data/types';
import { formatMoney } from '../utils/format';
import CandidateBadge from './CandidateBadge';
import StatusChip from './StatusChip';
import styles from './CandidateSummaryCard.module.scss';

interface CandidateSummaryCardProps {
  candidate: Candidate;
  onOpenDetail: (id: number) => void;
}

/** 종합 비교 화면 상단의 후보 요약 카드 */
function CandidateSummaryCard({ candidate, onOpenDetail }: CandidateSummaryCardProps) {
  const { criminal, assets, materials } = candidate;
  const missingMaterials = [
    materials.bulletin ? null : '선거공보',
    materials.pledgeBook ? null : '선거공약서',
    materials.fivePledges ? null : '5대공약',
  ].filter((v): v is string => v !== null);

  return (
    <article className={styles.CandidateSummaryCard}>
      <div className={styles.PosterWrap}>
        <img
          className={styles.Poster}
          src={candidate.poster}
          alt={`${candidate.name} 후보 선거공보 표지`}
          loading="lazy"
        />
        <span
          className={styles.PartyTag}
          style={{ backgroundColor: candidate.partyColor }}
        >
          {candidate.party}
        </span>
      </div>

      <div className={styles.Body}>
        <div className={styles.NameRow}>
          <CandidateBadge id={candidate.id} color={candidate.partyColor} size="md" />
          <div className={styles.NameBox}>
            <h3 className={styles.Name}>{candidate.name}</h3>
            <p className={styles.Meta}>
              만 {candidate.age}세 · {candidate.job}
            </p>
          </div>
        </div>

        <p className={styles.Slogan}>“{candidate.slogan}”</p>

        <div className={styles.ChipRow}>
          <StatusChip
            tone={criminal.hasRecord ? 'danger' : 'positive'}
            label={criminal.hasRecord ? `전과 ${criminal.items.length}건` : '전과 없음'}
          />
          <StatusChip
            tone={assets.total < 0 ? 'warning' : 'neutral'}
            label={`재산 ${formatMoney(assets.total)}`}
          />
          <StatusChip
            tone={missingMaterials.length > 0 ? 'danger' : 'positive'}
            label={
              missingMaterials.length > 0
                ? `${missingMaterials.join('·')} 미제출`
                : '자료 3종 제출'
            }
          />
        </div>

        <button
          type="button"
          className={styles.DetailButton}
          onClick={() => onOpenDetail(candidate.id)}
        >
          상세 정보 보기
        </button>
      </div>
    </article>
  );
}

export default CandidateSummaryCard;
