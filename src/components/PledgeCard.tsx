import { useState } from 'react';
import type { Pledge, PledgeReviewItem, ReviewVerdict } from '../data/types';
import { CATEGORY_META } from '../data/categories';
import PledgeReviewDetail, { RecycleMiniBadges } from './PledgeReviewDetail';
import styles from './PledgeCard.module.scss';

interface PledgeCardProps {
  pledge: Pledge;
  accentColor: string;
  /** 공약 적정성 교차검증 결과(있으면 판정 배지·평가 표시) */
  review?: PledgeReviewItem;
  /** 처음부터 펼친 상태로 표시할지 */
  defaultOpen?: boolean;
}

const VERDICT_LABEL: Record<ReviewVerdict, string> = {
  sound: '적정',
  caution: '주의',
  unsound: '부적정',
};

interface PledgeSectionProps {
  label: string;
  items: string[];
}

function PledgeSection({ label, items }: PledgeSectionProps) {
  return (
    <div className={styles.Section}>
      <span className={styles.SectionLabel}>{label}</span>
      <ul className={styles.SectionList}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** 공약 1건을 펼침/접힘으로 보여주는 카드 */
function PledgeCard({ pledge, accentColor, review, defaultOpen = false }: PledgeCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `pledge-${pledge.rank}-${pledge.title}`;
  const category = CATEGORY_META[pledge.category];

  return (
    <div className={styles.PledgeCard}>
      <button
        type="button"
        className={styles.Header}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.Rank} style={{ backgroundColor: accentColor }}>
          공약 {pledge.rank}
        </span>
        <span className={styles.TitleBox}>
          <span className={styles.CategoryTag}>
            {category.icon} {category.label}
          </span>
          <span className={styles.Title}>{pledge.title}</span>
        </span>
        {review ? (
          <span
            className={`${styles.Nature} ${
              review.nature === 'commitment' ? styles.commitment : styles.aspiration
            }`}
          >
            {review.nature === 'commitment' ? '공약' : '목표'}
          </span>
        ) : null}
        {review ? <RecycleMiniBadges review={review} /> : null}
        {review ? (
          <span className={`${styles.Verdict} ${styles[review.verdict]}`}>
            {VERDICT_LABEL[review.verdict]}
          </span>
        ) : null}
        <span className={`${styles.Chevron} ${open ? styles.openChevron : ''}`} aria-hidden>
          ⌄
        </span>
      </button>

      {open ? (
        <div className={styles.Content} id={contentId}>
          {review ? (
            <div className={styles.ReviewWrap}>
              <span className={styles.ReviewTitle}>공약 적정성 교차검증</span>
              <PledgeReviewDetail review={review} />
            </div>
          ) : null}
          <PledgeSection label="목표" items={pledge.goals} />
          <PledgeSection label="이행방법" items={pledge.methods} />
          <PledgeSection label="이행기간" items={pledge.period} />
          <PledgeSection label="재원조달" items={pledge.funding} />
        </div>
      ) : null}
    </div>
  );
}

export default PledgeCard;
