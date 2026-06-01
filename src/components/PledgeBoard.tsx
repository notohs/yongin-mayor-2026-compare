import type { Candidate } from '../data/types';
import CandidateBadge from './CandidateBadge';
import PledgeCard from './PledgeCard';
import SectionTitle from './SectionTitle';
import styles from './PledgeBoard.module.scss';

interface PledgeBoardProps {
  candidates: Candidate[];
}

/** 공약 비교 화면: 후보별 5대 공약을 열로 나란히 배치 */
function PledgeBoard({ candidates }: PledgeBoardProps) {
  return (
    <div className={styles.PledgeBoard}>
      <SectionTitle
        title="5대 공약 비교"
        description="공약 제목을 누르면 목표·이행방법·이행기간·재원조달을 펼쳐볼 수 있습니다."
      />

      <div className={styles.Columns}>
        {candidates.map((candidate) => (
          <section key={candidate.id} className={styles.Column}>
            <header
              className={styles.ColumnHead}
              style={{ borderTopColor: candidate.partyColor }}
            >
              <CandidateBadge id={candidate.id} color={candidate.partyColor} size="sm" />
              <div className={styles.ColumnHeadText}>
                <span className={styles.ColumnName}>{candidate.name}</span>
                <span className={styles.ColumnParty}>{candidate.party}</span>
              </div>
            </header>

            <div className={styles.PledgeList}>
              {candidate.pledges.map((pledge, index) => (
                <PledgeCard
                  key={pledge.rank}
                  pledge={pledge}
                  accentColor={candidate.partyColor}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default PledgeBoard;
