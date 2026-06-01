import styles from './StatusChip.module.scss';

export type StatusTone = 'positive' | 'warning' | 'danger' | 'neutral';

interface StatusChipProps {
  tone: StatusTone;
  label: string;
}

/** 전과/체납 여부 등 검증 상태를 색으로 구분해 보여주는 칩 */
function StatusChip({ tone, label }: StatusChipProps) {
  return <span className={`${styles.StatusChip} ${styles[tone]}`}>{label}</span>;
}

export default StatusChip;
