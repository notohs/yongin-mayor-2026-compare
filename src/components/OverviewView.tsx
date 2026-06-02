import type { Candidate } from '../data/types';
import CandidateSummaryCard from './CandidateSummaryCard';
import CompareGrid, { type CompareRow } from './CompareGrid';
import SectionTitle from './SectionTitle';
import styles from './OverviewView.module.scss';

interface OverviewViewProps {
  candidates: Candidate[];
  onOpenDetail: (id: number) => void;
}

const quickRows: CompareRow[] = [
  {
    key: 'age',
    label: '나이 · 성별',
    render: (c) => `만 ${c.age}세 · ${c.gender}`,
  },
  { key: 'job', label: '직업', render: (c) => c.job },
  { key: 'education', label: '학력', render: (c) => c.education },
  {
    key: 'vision',
    label: '한 줄 비전',
    render: (c) => <span className={styles.MutedText}>{c.vision}</span>,
  },
];

/** 종합 비교 화면: 후보 요약 카드 + 핵심 정보 비교표 */
function OverviewView({ candidates, onOpenDetail }: OverviewViewProps) {
  return (
    <div className={styles.OverviewView}>
      <div className={styles.CardGrid}>
        {candidates.map((candidate, i) => (
          <CandidateSummaryCard
            key={candidate.id}
            candidate={candidate}
            onOpenDetail={onOpenDetail}
            index={i}
          />
        ))}
      </div>

      <SectionTitle title="핵심 정보 한눈에 비교" />
      <CompareGrid candidates={candidates} rows={quickRows} />
    </div>
  );
}

export default OverviewView;
