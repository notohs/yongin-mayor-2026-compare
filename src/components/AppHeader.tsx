import type { ElectionMeta } from '../data/types';
import styles from './AppHeader.module.scss';

interface ElectionOption {
  id: string;
  region: string;
}

interface AppHeaderProps {
  meta: ElectionMeta;
  elections: ElectionOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenAdmin: () => void;
}

/** 페이지 상단 타이틀 영역 + (지역이 둘 이상이면) 선거 선택기 + 관리자 콘솔 진입 */
function AppHeader({ meta, elections, selectedId, onSelect, onOpenAdmin }: AppHeaderProps) {
  return (
    <header className={styles.AppHeader}>
      <div className={styles.Inner}>
        <div className={styles.TopRow}>
          <p className={styles.Subtitle}>{meta.subtitle}</p>
          <div className={styles.TopActions}>
            {elections.length > 1 ? (
              <label className={styles.Selector}>
                <span className={styles.SelectorLabel}>지역</span>
                <select
                  className={styles.Select}
                  value={selectedId}
                  onChange={(event) => onSelect(event.target.value)}
                >
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.region}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button type="button" className={styles.AdminButton} onClick={onOpenAdmin}>
              관리자 콘솔
            </button>
          </div>
        </div>
        <h1 className={styles.Title}>{meta.title}</h1>
        <p className={styles.Note}>{meta.note}</p>
      </div>
    </header>
  );
}

export default AppHeader;
