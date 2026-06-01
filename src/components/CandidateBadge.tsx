import styles from './CandidateBadge.module.scss';

interface CandidateBadgeProps {
  /** 기호 */
  id: number;
  /** 정당 색상 */
  color: string;
  /** 크기 변형 */
  size?: 'sm' | 'md' | 'lg';
}

/** 기호 번호를 정당 색상으로 표시하는 원형 배지 */
function CandidateBadge({ id, color, size = 'md' }: CandidateBadgeProps) {
  return (
    <span
      className={`${styles.CandidateBadge} ${styles[size]}`}
      style={{ backgroundColor: color }}
      aria-label={`기호 ${id}번`}
    >
      {id}
    </span>
  );
}

export default CandidateBadge;
