import { useState } from 'react';
import type { BulletinData, PolicyGroup } from '../data/types';
import styles from './BulletinPolicies.module.scss';

interface BulletinPoliciesProps {
  data?: BulletinData;
  accentColor: string;
}

interface PolicyGroupCardProps {
  group: PolicyGroup;
  accentColor: string;
}

/** 분야별 공보 공약 묶음 1개 (펼침/접힘) */
function PolicyGroupCard({ group, accentColor }: PolicyGroupCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.GroupCard}>
      <button
        type="button"
        className={styles.GroupHeader}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.GroupIcon} aria-hidden>
          {group.icon}
        </span>
        <span className={styles.GroupTitleBox}>
          <span className={styles.GroupField}>{group.field}</span>
          {group.headline ? (
            <span className={styles.GroupHeadline}>{group.headline}</span>
          ) : null}
        </span>
        <span className={styles.GroupCount} style={{ color: accentColor }}>
          {group.items.length}
        </span>
        <span className={`${styles.Chevron} ${open ? styles.openChevron : ''}`} aria-hidden>
          ⌄
        </span>
      </button>

      {open ? (
        <ul className={styles.ItemList}>
          {group.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** 후보의 선거공보 분야별 세부 공약 섹션 */
function BulletinPolicies({ data, accentColor }: BulletinPoliciesProps) {
  if (!data) return null;

  return (
    <div className={styles.BulletinPolicies}>
      <p className={styles.Note}>{data.note}</p>
      {data.groups.length > 0 ? (
        <div className={styles.Groups}>
          {data.groups.map((group) => (
            <PolicyGroupCard key={group.field} group={group} accentColor={accentColor} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default BulletinPolicies;
