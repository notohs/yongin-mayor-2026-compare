import styles from './StatusChip.module.scss';

export type StatusTone = 'positive' | 'warning' | 'danger' | 'neutral';

interface StatusChipProps {
  tone: StatusTone;
  label: string;
  /** 글리프 없이 텍스트만 (이미 의미가 분명한 경우) */
  plain?: boolean;
}

const GLYPH: Record<StatusTone, string> = {
  positive: '✓',
  danger: '✕',
  warning: '!',
  neutral: '',
};

/** 검증 상태 칩 — 색 + 글리프 + 텍스트 병기(색만으로 구분 금지) */
function StatusChip({ tone, label, plain }: StatusChipProps) {
  const glyph = GLYPH[tone];
  return (
    <span className={`${styles.StatusChip} ${styles[tone]}`}>
      {!plain && glyph ? (
        <span className={styles.Glyph} aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      {label}
    </span>
  );
}

export default StatusChip;
