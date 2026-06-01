import type { Candidate } from '../data/types';
import type { QuizResult as QuizResultData } from '../utils/quizStorage';
import type { VerifyKind, VerifyVerdict } from '../utils/quizEngine';
import { CATEGORY_META } from '../data/categories';
import { formatDateTime, formatScore } from '../utils/format';
import CandidateBadge from './CandidateBadge';
import StatusChip from './StatusChip';
import type { StatusTone } from './StatusChip';
import styles from './QuizResult.module.scss';

interface QuizResultProps {
  result: QuizResultData;
  candidates: Candidate[];
  origin: 'fresh' | 'history';
  onRestart: () => void;
  onViewHistory: () => void;
}

const VERIFY_KIND_META: Record<VerifyKind, { label: string; icon: string }> = {
  military: { label: '병역', icon: '🪖' },
  arrears: { label: '체납', icon: '💸' },
  criminal: { label: '전과', icon: '⚖️' },
};

const VERDICT_META: Record<VerifyVerdict, { label: string; tone: StatusTone }> = {
  ok: { label: '괜찮다', tone: 'positive' },
  reluctant: { label: '내키지 않음 (−1)', tone: 'warning' },
  never: { label: '절대 안된다 (배제)', tone: 'danger' },
};

/** 퀴즈 결과 화면: 추천/배제 후보 + 후보별 점수 + 정책 선택·검증 응답 공개 */
function QuizResult({ result, candidates, origin, onRestart, onViewHistory }: QuizResultProps) {
  const getCandidate = (id: number): Candidate | undefined =>
    candidates.find((candidate) => candidate.id === id);

  const selectionCount = result.picks.length;
  const questionCount = new Set(result.picks.map((pick) => pick.stepId)).size;
  const recommended = result.recommendedIds
    .map(getCandidate)
    .filter((candidate): candidate is Candidate => candidate !== undefined);
  const disqualified = result.disqualifiedIds
    .map(getCandidate)
    .filter((candidate): candidate is Candidate => candidate !== undefined);
  const hasRecommendation = recommended.length > 0;
  const isTie = recommended.length > 1;
  const topScore = hasRecommendation ? result.scores[recommended[0].id] ?? 0 : 0;

  const ranked = candidates
    .map((candidate) => ({ candidate, score: result.scores[candidate.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const maxScore = Math.max(0, ...ranked.map((row) => row.score));

  const reluctantCount = (id: number): number =>
    result.verifyAnswers.filter((a) => a.candidateId === id && a.verdict === 'reluctant').length;

  const groupedPicks = result.picks.reduce<
    { stepId: string; category: typeof result.picks[number]['category']; picks: typeof result.picks }[]
  >((groups, pick) => {
    const existing = groups.find((group) => group.stepId === pick.stepId);
    if (existing) existing.picks.push(pick);
    else groups.push({ stepId: pick.stepId, category: pick.category, picks: [pick] });
    return groups;
  }, []);

  return (
    <div className={styles.QuizResult}>
      <header className={styles.Header}>
        <span className={styles.Eyebrow}>{result.nickname}님의 결과</span>
        <h2 className={styles.HeaderTitle}>
          {!hasRecommendation ? '추천할 후보 없음' : isTie ? '공동 추천 후보' : '추천 후보'}
        </h2>
        <span className={styles.Date}>{formatDateTime(result.date)}</span>
      </header>

      {hasRecommendation ? (
        <div className={styles.RecCards}>
          {recommended.map((candidate) => (
            <article
              key={candidate.id}
              className={styles.RecCard}
              style={{ borderTopColor: candidate.partyColor }}
            >
              <img
                className={styles.RecPoster}
                src={candidate.poster}
                alt={`${candidate.name} 후보`}
              />
              <div className={styles.RecInfo}>
                <div className={styles.RecName}>
                  <CandidateBadge id={candidate.id} color={candidate.partyColor} size="sm" />
                  <span>{candidate.name}</span>
                </div>
                <span className={styles.RecParty}>{candidate.party}</span>
                <span className={styles.RecCount}>{formatScore(topScore)}점</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.NoRec}>
          모든 후보를 ‘절대 안된다’로 배제하여 추천할 후보가 없습니다.
        </div>
      )}

      <p className={styles.Summary}>
        {questionCount}개 정책 문항에서 {selectionCount}개 공약을 고르고 병역·체납·전과 검증까지
        반영했습니다.
        {hasRecommendation
          ? ` ${recommended.map((c) => c.name).join(', ')} 후보가 ${formatScore(topScore)}점으로 가장 높았습니다.`
          : ''}
        {disqualified.length > 0
          ? ` ${disqualified.map((c) => c.name).join(', ')} 후보는 배제되었습니다.`
          : ''}
      </p>

      <section className={styles.Block}>
        <h3 className={styles.BlockTitle}>후보별 점수</h3>
        <p className={styles.BlockHint}>정책 선택 가중치 합에서 검증 감점을 뺀 점수입니다.</p>
        <ul className={styles.Bars}>
          {ranked.map(({ candidate, score }) => {
            const isOut = result.disqualifiedIds.includes(candidate.id);
            const ratio = !isOut && maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;
            const reluctant = reluctantCount(candidate.id);
            return (
              <li
                key={candidate.id}
                className={`${styles.BarRow} ${isOut ? styles.barOut : ''}`}
              >
                <span className={styles.BarLabel}>
                  <CandidateBadge id={candidate.id} color={candidate.partyColor} size="sm" />
                  {candidate.name}
                </span>
                <span className={styles.BarTrack}>
                  <span
                    className={styles.BarFill}
                    style={{ width: `${ratio}%`, backgroundColor: candidate.partyColor }}
                  />
                </span>
                <span className={styles.BarValue}>
                  {isOut ? (
                    <span className={styles.OutTag}>배제</span>
                  ) : (
                    <>
                      {formatScore(score)}점
                      {reluctant > 0 ? <span className={styles.Penalty}> (−{reluctant})</span> : null}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.Block}>
        <h3 className={styles.BlockTitle}>내가 고른 공약</h3>
        <ul className={styles.Picks}>
          {groupedPicks.map((group) => {
            const meta = CATEGORY_META[group.category];
            return (
              <li key={group.stepId} className={styles.PickItem}>
                <span className={styles.PickCategory}>
                  {meta.icon} {meta.label}
                  {group.picks.length > 1 ? (
                    <span className={styles.WeightTag}>2개 선택 · 각 0.7점</span>
                  ) : null}
                </span>
                {group.picks.map((pick) => {
                  const candidate = getCandidate(pick.candidateId);
                  return (
                    <div key={`${pick.stepId}-${pick.candidateId}`} className={styles.PickEntry}>
                      <p className={styles.PickBlurb}>{pick.blurb}</p>
                      <span className={styles.PickWho}>
                        {candidate ? (
                          <>
                            <CandidateBadge
                              id={candidate.id}
                              color={candidate.partyColor}
                              size="sm"
                            />
                            {candidate.name} · {pick.pledgeTitle}
                          </>
                        ) : (
                          pick.pledgeTitle
                        )}
                      </span>
                    </div>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </section>

      {result.verifyAnswers.length > 0 ? (
        <section className={styles.Block}>
          <h3 className={styles.BlockTitle}>검증 문항 응답</h3>
          <ul className={styles.Verify}>
            {result.verifyAnswers.map((answer) => {
              const candidate = getCandidate(answer.candidateId);
              const meta = VERIFY_KIND_META[answer.kind];
              const verdict = VERDICT_META[answer.verdict];
              return (
                <li key={answer.stepId} className={styles.VerifyItem}>
                  <div className={styles.VerifyTop}>
                    <span className={styles.VerifyKind}>
                      {meta.icon} {meta.label}
                    </span>
                    <StatusChip tone={verdict.tone} label={verdict.label} />
                  </div>
                  <p className={styles.VerifyRecord}>{answer.recordText}</p>
                  <span className={styles.PickWho}>
                    {candidate ? (
                      <>
                        <CandidateBadge
                          id={candidate.id}
                          color={candidate.partyColor}
                          size="sm"
                        />
                        {candidate.name}
                      </>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className={styles.Actions}>
        <button type="button" className={styles.PrimaryButton} onClick={onRestart}>
          다시 풀기
        </button>
        <button type="button" className={styles.SecondaryButton} onClick={onViewHistory}>
          {origin === 'history' ? '목록으로 돌아가기' : '이전 결과 보기'}
        </button>
      </div>

      {origin === 'fresh' ? (
        <p className={styles.SavedNote}>이 결과는 “{result.nickname}” 이름으로 저장되었습니다.</p>
      ) : null}
    </div>
  );
}

export default QuizResult;
