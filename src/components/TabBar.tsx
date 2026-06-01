import styles from './TabBar.module.scss';

export interface TabItem {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

/** 상단 섹션 내비게이션 탭 바 */
function TabBar({ tabs, activeKey, onChange }: TabBarProps) {
  return (
    <nav className={styles.TabBar} aria-label="비교 항목">
      <ul className={styles.TabList}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <li key={tab.key} className={styles.TabItem}>
              <button
                type="button"
                className={`${styles.TabButton} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onChange(tab.key)}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default TabBar;
