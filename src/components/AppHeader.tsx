import type { ReactNode } from 'react';
import type { ElectionMeta } from '../data/types';
import styles from './AppHeader.module.scss';

interface ElectionOption {
  id: string;
  region: string;
}

type ThemeMode = 'dark' | 'light';

interface AppHeaderProps {
  meta: ElectionMeta;
  elections: ElectionOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenAdmin: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  /** 같은 sticky 바 안에 들어갈 탭 내비게이션 */
  tabSlot?: ReactNode;
}

/** 브로드캐스트 상단 바 — 브랜드 + 라이브 + 지역 선택 + 테마 토글 + 탭 내비 */
function AppHeader({
  meta,
  elections,
  selectedId,
  onSelect,
  onOpenAdmin,
  theme,
  onToggleTheme,
  tabSlot,
}: AppHeaderProps) {
  return (
    <header className={styles.Topbar}>
      <div className={styles.Inner}>
        <div className={styles.Row}>
          <div className={styles.Brand}>
            <span className={styles.Mark}>VW</span>
            <div>
              <div className={styles.Title}>{meta.title}</div>
              <div className={styles.Sub}>{meta.subtitle}</div>
            </div>
          </div>
          <div className={styles.Right}>
            <span className={styles.Live}>
              <span className={styles.LiveDot} aria-hidden="true" />
              중앙선관위 자료
            </span>
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
            <button
              type="button"
              className={styles.ThemeToggle}
              onClick={onToggleTheme}
              aria-label="테마 전환"
            >
              <span className={styles.ThemeGlyph} aria-hidden="true">
                {theme === 'dark' ? '◐' : '◑'}
              </span>
              {theme === 'dark' ? '라이트 모드' : '다크 모드'}
            </button>
            <button type="button" className={styles.AdminButton} onClick={onOpenAdmin}>
              관리자 콘솔
            </button>
          </div>
        </div>
        {tabSlot}
      </div>
    </header>
  );
}

export default AppHeader;
