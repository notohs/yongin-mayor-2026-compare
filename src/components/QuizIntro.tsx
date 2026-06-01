import type { Candidate } from '../data/types';
import type { QuizThemeDef } from '../data/quizThemes';
import type { QuizResult } from '../utils/quizStorage';
import { countSteps } from '../utils/quizEngine';
import { formatDateTime } from '../utils/format';
import styles from './QuizIntro.module.scss';

interface QuizIntroProps {
  nickname: string;
  onNicknameChange: (value: string) => void;
  onStart: () => void;
  recentResults: QuizResult[];
  onViewHistory: () => void;
  candidates: Candidate[];
  quizThemes: QuizThemeDef[];
}

const MAX_NICKNAME = 16;

/** 퀴즈 시작 화면: 닉네임 입력 + 최근 결과 미리보기 */
function QuizIntro({
  nickname,
  onNicknameChange,
  onStart,
  recentResults,
  onViewHistory,
  candidates,
  quizThemes,
}: QuizIntroProps) {
  const trimmed = nickname.trim();
  const canStart = trimmed.length > 0;
  const { policy, verify } = countSteps(candidates, quizThemes);

  const candidateName = (id: number) =>
    candidates.find((candidate) => candidate.id === id)?.name ?? `기호 ${id}`;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (canStart) onStart();
  };

  return (
    <div className={styles.QuizIntro}>
      <div className={styles.Hero}>
        <span className={styles.Badge}>공약 블라인드 퀴즈</span>
        <h2 className={styles.Title}>누구 공약인지 모른 채 골라보세요</h2>
        <p className={styles.Desc}>
          후보 이름을 가린 정책 {policy}문항(각 문항 <strong>최대 2개</strong> 선택)과, 후보의
          병역·체납·전과를 점검하는 검증 {verify}문항이 제시됩니다. 선택을 마치면 종합 점수로
          어느 후보가 가장 잘 맞는지 알려드립니다.
        </p>

        <form className={styles.Form} onSubmit={handleSubmit}>
          <label className={styles.FieldLabel} htmlFor="nickname">
            닉네임
          </label>
          <div className={styles.FieldRow}>
            <input
              id="nickname"
              className={styles.Input}
              type="text"
              value={nickname}
              maxLength={MAX_NICKNAME}
              placeholder="결과 저장에 사용할 닉네임"
              onChange={(event) => onNicknameChange(event.target.value)}
              autoComplete="off"
            />
            <button type="submit" className={styles.StartButton} disabled={!canStart}>
              퀴즈 시작
            </button>
          </div>
          <p className={styles.Hint}>
            결과는 닉네임과 함께 이 브라우저에만 저장되며, 외부로 전송되지 않습니다.
          </p>
        </form>
      </div>

      {recentResults.length > 0 ? (
        <section className={styles.Recent}>
          <div className={styles.RecentHead}>
            <h3 className={styles.RecentTitle}>최근 결과</h3>
            <button type="button" className={styles.LinkButton} onClick={onViewHistory}>
              이전 결과 전체 보기
            </button>
          </div>
          <ul className={styles.RecentList}>
            {recentResults.slice(0, 3).map((result) => (
              <li key={result.id} className={styles.RecentItem}>
                <span className={styles.RecentNick}>{result.nickname}</span>
                <span className={styles.RecentRec}>
                  {result.recommendedIds.map(candidateName).join(', ')} 추천
                </span>
                <span className={styles.RecentDate}>{formatDateTime(result.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default QuizIntro;
