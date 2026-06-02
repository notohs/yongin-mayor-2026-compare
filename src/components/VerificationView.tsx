import type { Candidate, CandidateReview } from '../data/types';
import { formatMoney, formatThousandWon } from '../utils/format';
import CompareGrid, { type CompareRow } from './CompareGrid';
import SectionTitle from './SectionTitle';
import StatusChip from './StatusChip';
import MaterialStatus from './MaterialStatus';
import PledgeReviewPanel from './PledgeReviewPanel';
import styles from './VerificationView.module.scss';

interface VerificationViewProps {
  candidates: Candidate[];
  pledgeReviews?: Record<number, CandidateReview>;
}

const verificationRows: CompareRow[] = [
  {
    key: 'materials',
    label: '선관위 자료 제출',
    render: (c) => <MaterialStatus materials={c.materials} />,
  },
  {
    key: 'education',
    label: '학력',
    render: (c) => c.education,
  },
  {
    key: 'careers',
    label: '주요 경력',
    render: (c) => (
      <ul className={styles.List}>
        {c.careers.map((career) => (
          <li key={career}>{career}</li>
        ))}
      </ul>
    ),
  },
  {
    key: 'assets',
    label: '재산 (신고 총액)',
    render: (c) => (
      <div className={styles.Stack}>
        <strong
          className={styles.Amount}
          style={{ color: c.assets.total < 0 ? 'var(--danger)' : undefined }}
        >
          {formatMoney(c.assets.total)}
        </strong>
        <span className={styles.SubLine}>본인 {formatMoney(c.assets.candidate)}</span>
        <span className={styles.SubLine}>{c.assets.breakdown}</span>
      </div>
    ),
  },
  {
    key: 'tax',
    label: '납세 (최근 5년)',
    render: (c) => (
      <div className={styles.Stack}>
        <strong className={styles.Amount}>{formatThousandWon(c.tax.totalPaid)}</strong>
        <span className={styles.SubLine}>
          본인 {formatThousandWon(c.tax.candidatePaid)}
        </span>
      </div>
    ),
  },
  {
    key: 'taxRatio',
    label: '재산 대비 실질 납세율',
    render: (c) => {
      // 실질 납세 = 납세액 − 현 체납액(아직 안 낸 세금은 차감). 재산은 신고 총액 기준.
      const netTax = c.tax.totalPaid - c.tax.currentArrears;
      if (c.assets.total <= 0) {
        return (
          <div className={styles.Stack}>
            <strong className={styles.Amount}>산정 불가</strong>
            <span className={styles.SubLine}>재산 신고총액 0 이하</span>
          </div>
        );
      }
      const ratio = (netTax / c.assets.total) * 100;
      return (
        <div className={styles.Stack}>
          <strong className={`${styles.Amount} num`}>{ratio.toFixed(2)}%</strong>
          <span className={styles.SubLine}>
            (납세 {formatThousandWon(c.tax.totalPaid)}
            {c.tax.currentArrears > 0 ? ` − 체납 ${formatThousandWon(c.tax.currentArrears)}` : ''}) ÷
            재산 {formatMoney(c.assets.total)}
          </span>
        </div>
      );
    },
  },
  {
    key: 'arrears',
    label: '체납',
    render: (c) => (
      <div className={styles.Stack}>
        <StatusChip
          tone={c.tax.currentArrears > 0 ? 'danger' : 'positive'}
          label={c.tax.currentArrears > 0 ? formatThousandWon(c.tax.currentArrears) : '현 체납 없음'}
        />
        {c.tax.note ? <span className={styles.SubLine}>{c.tax.note}</span> : null}
      </div>
    ),
  },
  {
    key: 'military',
    label: '병역',
    render: (c) => (
      <div className={styles.Stack}>
        <span>{c.military.candidate}</span>
        {c.military.note ? <span className={styles.SubLine}>{c.military.note}</span> : null}
      </div>
    ),
  },
  {
    key: 'criminal',
    label: '전과',
    render: (c) => (
      <div className={styles.Stack}>
        <StatusChip
          tone={c.criminal.hasRecord ? 'danger' : 'positive'}
          label={c.criminal.hasRecord ? `전과 ${c.criminal.items.length}건` : '전과 없음'}
        />
        {c.criminal.hasRecord ? (
          <ul className={styles.List}>
            {c.criminal.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    ),
  },
];

/** 검증 비교 화면: 학력·경력·재산·납세·병역·전과를 항목별로 나란히 비교 */
function VerificationView({ candidates, pledgeReviews }: VerificationViewProps) {
  return (
    <div className={styles.VerificationView}>
      <SectionTitle
        title="인물·검증 항목 비교"
        description="중앙선거관리위원회 후보자정보공개자료 기준입니다. ‘선관위 자료 제출’의 미등록은 자료를 성실히 제출했는지에 대한 참고 지표입니다. 재산·납세는 천원 단위로 신고된 금액입니다."
      />
      <CompareGrid candidates={candidates} rows={verificationRows} />
      <PledgeReviewPanel candidates={candidates} pledgeReviews={pledgeReviews} />
    </div>
  );
}

export default VerificationView;
