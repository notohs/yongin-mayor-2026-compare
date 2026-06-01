import type { Candidate } from '../data/types';
import type { QuizResult } from '../utils/quizStorage';
import { formatDateTime } from '../utils/format';
import CandidateBadge from './CandidateBadge';
import styles from './QuizHistory.module.scss';

interface QuizHistoryProps {
  results: QuizResult[];
  candidates: Candidate[];
  onSelect: (result: QuizResult) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onBack: () => void;
}

/** 로컬에 저장된 이전 퀴즈 결과 목록 */
function QuizHistory({
  results,
  candidates,
  onSelect,
  onDelete,
  onClear,
  onBack,
}: QuizHistoryProps) {
  const getCandidate = (id: number): Candidate | undefined =>
    candidates.find((candidate) => candidate.id === id);

  return (
    <div className={styles.QuizHistory}>
      <header className={styles.Head}>
        <h2 className={styles.Title}>이전 결과</h2>
        <div className={styles.HeadActions}>
          {results.length > 0 ? (
            <button type="button" className={styles.ClearButton} onClick={onClear}>
              전체 삭제
            </button>
          ) : null}
          <button type="button" className={styles.BackButton} onClick={onBack}>
            처음으로
          </button>
        </div>
      </header>

      {results.length === 0 ? (
        <div className={styles.Empty}>
          <p className={styles.EmptyText}>저장된 결과가 없습니다. 퀴즈를 먼저 풀어보세요.</p>
        </div>
      ) : (
        <ul className={styles.List}>
          {results.map((result) => {
            const recommended = result.recommendedIds
              .map(getCandidate)
              .filter((candidate): candidate is Candidate => candidate !== undefined);
            return (
              <li key={result.id} className={styles.Item}>
                <button
                  type="button"
                  className={styles.ItemMain}
                  onClick={() => onSelect(result)}
                >
                  <span className={styles.ItemTop}>
                    <span className={styles.Nick}>{result.nickname}</span>
                    <span className={styles.ItemDate}>{formatDateTime(result.date)}</span>
                  </span>
                  <span className={styles.RecRow}>
                    {recommended.map((candidate) => (
                      <span key={candidate.id} className={styles.RecTag}>
                        <CandidateBadge
                          id={candidate.id}
                          color={candidate.partyColor}
                          size="sm"
                        />
                        {candidate.name}
                      </span>
                    ))}
                    <span className={styles.RecLabel}>추천</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.DeleteButton}
                  onClick={() => onDelete(result.id)}
                  aria-label={`${result.nickname} 결과 삭제`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default QuizHistory;
