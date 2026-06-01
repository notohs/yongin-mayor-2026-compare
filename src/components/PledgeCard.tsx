import { useState } from 'react';
import type { Pledge } from '../data/types';
import { CATEGORY_META } from '../data/categories';
import styles from './PledgeCard.module.scss';

interface PledgeCardProps {
  pledge: Pledge;
  accentColor: string;
  /** 처음부터 펼친 상태로 표시할지 */
  defaultOpen?: boolean;
}

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
function PledgeCard({ pledge, accentColor, defaultOpen = false }: PledgeCardProps) {
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
        <span className={`${styles.Chevron} ${open ? styles.openChevron : ''}`} aria-hidden>
          ⌄
        </span>
      </button>

      {open ? (
        <div className={styles.Content} id={contentId}>
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
