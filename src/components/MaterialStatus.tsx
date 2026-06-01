import type { MaterialSubmission } from '../data/types';
import styles from './MaterialStatus.module.scss';

interface MaterialStatusProps {
  materials: MaterialSubmission;
}

const ITEMS: { key: keyof MaterialSubmission; label: string }[] = [
  { key: 'bulletin', label: '선거공보' },
  { key: 'pledgeBook', label: '선거공약서' },
  { key: 'fivePledges', label: '5대공약' },
];

/** 선관위 제출 자료(선거공보·선거공약서·5대공약) 등록 현황. 미등록은 성실 제출 지표로 강조. */
function MaterialStatus({ materials }: MaterialStatusProps) {
  return (
    <ul className={styles.MaterialStatus}>
      {ITEMS.map(({ key, label }) => {
        const ok = materials[key];
        return (
          <li
            key={key}
            className={`${styles.Item} ${ok ? styles.ok : styles.missing}`}
          >
            <span className={styles.Mark} aria-hidden>
              {ok ? '✓' : '✕'}
            </span>
            <span className={styles.Label}>{label}</span>
            <span className={styles.State}>{ok ? '등록' : '미등록'}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default MaterialStatus;
