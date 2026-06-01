import { useState } from 'react';
import { CATEGORY_META } from '../data/categories';
import { MAX_SELECT, type PolicyStep, type QuizStepOption } from '../utils/quizEngine';
import styles from './QuizQuestion.module.scss';

interface QuizQuestionProps {
  step: PolicyStep;
  stepIndex: number;
  total: number;
  initialSelectedIds?: number[];
  canGoBack: boolean;
  onSubmit: (options: QuizStepOption[]) => void;
  onBack: () => void;
}

const OPTION_MARKERS = ['가', '나', '다'];

/** 퀴즈 1문항: 후보를 가린 선택지에서 1~2개를 골라 제출한다 */
function QuizQuestion({
  step,
  stepIndex,
  total,
  initialSelectedIds = [],
  canGoBack,
  onSubmit,
  onBack,
}: QuizQuestionProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const meta = CATEGORY_META[step.category];
  const progress = Math.round(((stepIndex + 1) / total) * 100);
  const isLast = stepIndex + 1 >= total;
  const atMax = selectedIds.length >= MAX_SELECT;

  const toggle = (candidateId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(candidateId)) return prev.filter((id) => id !== candidateId);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, candidateId];
    });
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    onSubmit(step.options.filter((option) => selectedIds.includes(option.candidateId)));
  };

  return (
    <div className={styles.QuizQuestion}>
      <div className={styles.ProgressBar} aria-hidden>
        <span className={styles.ProgressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.StepCount}>
        {stepIndex + 1} / {total}
      </p>

      <div className={styles.Head}>
        <span className={styles.CategoryChip}>
          <span className={styles.CategoryIcon} aria-hidden>
            {meta.icon}
          </span>
          {meta.label}
        </span>
        <h2 className={styles.Question}>{step.question}</h2>
        <p className={styles.Guide}>마음에 드는 공약을 최대 2개까지 고를 수 있어요.</p>
      </div>

      <ul className={styles.Options}>
        {step.options.map((option, index) => {
          const selected = selectedIds.includes(option.candidateId);
          const disabled = !selected && atMax;
          return (
            <li key={`${step.id}-${option.candidateId}`}>
              <button
                type="button"
                className={`${styles.OptionCard} ${selected ? styles.selected : ''}`}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => toggle(option.candidateId)}
              >
                <span className={`${styles.Marker} ${selected ? styles.markerOn : ''}`}>
                  {selected ? '✓' : (OPTION_MARKERS[index] ?? index + 1)}
                </span>
                <span className={styles.OptionText}>{option.blurb}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.Footer}>
        {canGoBack ? (
          <button type="button" className={styles.BackButton} onClick={onBack}>
            ← 이전
          </button>
        ) : (
          <span />
        )}
        <span className={styles.SelectCount}>
          {selectedIds.length} / {MAX_SELECT} 선택
        </span>
        <button
          type="button"
          className={styles.NextButton}
          disabled={selectedIds.length === 0}
          onClick={handleSubmit}
        >
          {isLast ? '결과 보기' : '다음'}
        </button>
      </div>

      <p className={styles.Anonymous}>후보 이름은 모든 선택이 끝난 뒤 공개됩니다.</p>
    </div>
  );
}

export default QuizQuestion;
