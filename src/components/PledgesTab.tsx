import type { BulletinData, Candidate, CandidateReview } from '../data/types';
import IntegratedPledgeTable from './IntegratedPledgeTable';

interface PledgesTabProps {
  candidates: Candidate[];
  bulletinPolicies: Record<number, BulletinData>;
  pledgeReviews?: Record<number, CandidateReview>;
}

/** 공약 비교 탭: 분야(행)×후보(열) 통합 표 + 항목 호버 상세 툴팁 */
function PledgesTab({ candidates, bulletinPolicies, pledgeReviews }: PledgesTabProps) {
  return (
    <IntegratedPledgeTable
      candidates={candidates}
      bulletinPolicies={bulletinPolicies}
      pledgeReviews={pledgeReviews}
    />
  );
}

export default PledgesTab;
