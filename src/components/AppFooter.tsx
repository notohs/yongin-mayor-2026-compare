import type { ElectionMeta } from '../data/types';
import styles from './AppFooter.module.scss';

interface AppFooterProps {
  meta: ElectionMeta;
}

/** 출처 및 안내 푸터 */
function AppFooter({ meta }: AppFooterProps) {
  return (
    <footer className={styles.AppFooter}>
      <div className={styles.Inner}>
        <p className={styles.Source}>자료 출처 · {meta.source}</p>
        <p className={styles.Disclaimer}>
          본 페이지의 공약·인적사항은 후보자가 제출한 자료를 정리·요약한 것으로,
          특정 후보를 지지하거나 반대하기 위한 목적이 아닙니다. 기호 순서는 후보자
          기호 번호 순입니다.
        </p>
      </div>
    </footer>
  );
}

export default AppFooter;
