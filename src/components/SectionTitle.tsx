import styles from './SectionTitle.module.scss';

interface SectionTitleProps {
  title: string;
  description?: string;
}

/** 섹션 제목 + 보조 설명 */
function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div className={styles.SectionTitle}>
      <h2 className={styles.Title}>{title}</h2>
      {description ? <p className={styles.Description}>{description}</p> : null}
    </div>
  );
}

export default SectionTitle;
