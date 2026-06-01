import type { VerifyKind, VerifyStep, VerifyVerdict } from '../utils/quizEngine';
import styles from './QuizVerifyQuestion.module.scss';

interface QuizVerifyQuestionProps {
  step: VerifyStep;
  stepIndex: number;
  total: number;
  initialVerdict?: VerifyVerdict;
  canGoBack: boolean;
  onAnswer: (verdict: VerifyVerdict) => void;
  onBack: () => void;
}

const KIND_META: Record<VerifyKind, { label: string; icon: string }> = {
  military: { label: '병역 검증', icon: '🪖' },
  arrears: { label: '체납 검증', icon: '💸' },
  criminal: { label: '전과 검증', icon: '⚖️' },
};

const CHOICES: { verdict: VerifyVerdict; label: string; note: string; tone: string }[] = [
  { verdict: 'ok', label: '괜찮다', note: '감점 없음', tone: 'ok' },
  {
    verdict: 'reluctant',
    label: '내키지는 않지만, 후보의 자질이 매우 훌륭하다면 뽑을 수도 있다',
    note: '−1점',
    tone: 'reluctant',
  },
  { verdict: 'never', label: '절대 안된다', note: '후보 배제', tone: 'never' },
];

/** 검증 문항: 후보의 병역·체납·전과 기록을 보고 수용 정도를 3단계로 묻는다 (후보명 비공개) */
function QuizVerifyQuestion({
  step,
  stepIndex,
  total,
  initialVerdict,
  canGoBack,
  onAnswer,
  onBack,
}: QuizVerifyQuestionProps) {
  const meta = KIND_META[step.kind];
  const progress = Math.round(((stepIndex + 1) / total) * 100);

  return (
    <div className={styles.QuizVerifyQuestion}>
      <div className={styles.ProgressBar} aria-hidden>
        <span className={styles.ProgressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.StepCount}>
        {stepIndex + 1} / {total}
      </p>

      <div className={styles.Head}>
        <span className={styles.KindChip}>
          <span aria-hidden>{meta.icon}</span> {meta.label}
        </span>
        <h2 className={styles.Question}>{step.prompt}</h2>
      </div>

      <div className={styles.Record}>
        <span className={styles.RecordLabel}>기록</span>
        <p className={styles.RecordText}>{step.recordText}</p>
      </div>

      <div className={styles.Choices}>
        {CHOICES.map((choice) => (
          <button
            key={choice.verdict}
            type="button"
            className={`${styles.ChoiceButton} ${styles[choice.tone]} ${
              initialVerdict === choice.verdict ? styles.selected : ''
            }`}
            onClick={() => onAnswer(choice.verdict)}
          >
            <span className={styles.ChoiceLabel}>{choice.label}</span>
            <span className={styles.ChoiceNote}>{choice.note}</span>
          </button>
        ))}
      </div>

      <div className={styles.Footer}>
        {canGoBack ? (
          <button type="button" className={styles.BackButton} onClick={onBack}>
            ← 이전
          </button>
        ) : (
          <span />
        )}
        <span className={styles.Hint}>‘절대 안된다’를 고르면 이 후보는 추천에서 제외됩니다.</span>
      </div>
    </div>
  );
}

export default QuizVerifyQuestion;
