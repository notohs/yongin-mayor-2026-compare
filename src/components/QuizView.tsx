import { useState } from 'react';
import type { Candidate } from '../data/types';
import type { QuizThemeDef } from '../data/types';
import {
  buildQuizSteps,
  computeScores,
  getDisqualifiedIds,
  recommendCandidates,
  weightForSelectionCount,
  type QuizPick,
  type QuizStep,
  type QuizStepOption,
  type VerifyAnswer,
  type VerifyStep,
  type VerifyVerdict,
} from '../utils/quizEngine';
import {
  clearElectionResults,
  createResultId,
  deleteResult,
  loadResults,
  saveResult,
  type QuizResult as QuizResultData,
} from '../utils/quizStorage';
import QuizIntro from './QuizIntro';
import QuizQuestion from './QuizQuestion';
import QuizVerifyQuestion from './QuizVerifyQuestion';
import QuizResult from './QuizResult';
import QuizHistory from './QuizHistory';
import styles from './QuizView.module.scss';

interface QuizViewProps {
  electionId: string;
  candidates: Candidate[];
  quizThemes: QuizThemeDef[];
}

type QuizPhase = 'intro' | 'playing' | 'result' | 'history';

/** 공약 블라인드 퀴즈 컨테이너 (정책 + 검증 단계, 이전 이동, 배제 처리) */
function QuizView({ electionId, candidates, quizThemes }: QuizViewProps) {
  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [nickname, setNickname] = useState('');
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [picks, setPicks] = useState<QuizPick[]>([]);
  const [verifyAnswers, setVerifyAnswers] = useState<VerifyAnswer[]>([]);
  const [savedResults, setSavedResults] = useState<QuizResultData[]>(() => loadResults());
  const [currentResult, setCurrentResult] = useState<QuizResultData | null>(null);
  const [resultOrigin, setResultOrigin] = useState<'fresh' | 'history'>('fresh');

  // 이 선거(지역)의 결과만 노출
  const electionResults = savedResults.filter((result) => result.electionId === electionId);

  const handleStart = () => {
    setSteps(buildQuizSteps(candidates, quizThemes));
    setPicks([]);
    setVerifyAnswers([]);
    setCurrentIndex(0);
    setPhase('playing');
  };

  const finishQuiz = (allPicks: QuizPick[], allVerify: VerifyAnswer[]) => {
    const scores = computeScores(allPicks, allVerify, candidates);
    const disqualifiedIds = getDisqualifiedIds(allVerify);
    const result: QuizResultData = {
      id: createResultId(),
      electionId,
      nickname: nickname.trim(),
      date: new Date().toISOString(),
      scores,
      disqualifiedIds,
      recommendedIds: recommendCandidates(scores, disqualifiedIds),
      picks: allPicks,
      verifyAnswers: allVerify,
    };
    setSavedResults(saveResult(result));
    setCurrentResult(result);
    setResultOrigin('fresh');
    setPhase('result');
  };

  const advance = (nextPicks: QuizPick[], nextVerify: VerifyAnswer[]) => {
    if (currentIndex + 1 >= steps.length) {
      finishQuiz(nextPicks, nextVerify);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePolicySubmit = (options: QuizStepOption[]) => {
    const step = steps[currentIndex] as Extract<QuizStep, { type: 'policy' }>;
    const weight = weightForSelectionCount(options.length);
    const stepPicks: QuizPick[] = options.map((option) => ({
      stepId: step.id,
      category: step.category,
      question: step.question,
      candidateId: option.candidateId,
      pledgeTitle: option.sourceTitle,
      blurb: option.blurb,
      weight,
    }));
    // 같은 문항을 다시 답하는 경우(이전 이동 후) 기존 선택을 교체
    const nextPicks = [...picks.filter((pick) => pick.stepId !== step.id), ...stepPicks];
    setPicks(nextPicks);
    advance(nextPicks, verifyAnswers);
  };

  const handleVerifyAnswer = (verdict: VerifyVerdict) => {
    const step = steps[currentIndex] as VerifyStep;
    const answer: VerifyAnswer = {
      stepId: step.id,
      kind: step.kind,
      candidateId: step.candidateId,
      recordText: step.recordText,
      prompt: step.prompt,
      verdict,
    };
    const nextVerify = [...verifyAnswers.filter((a) => a.stepId !== step.id), answer];
    setVerifyAnswers(nextVerify);
    advance(picks, nextVerify);
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSelectHistory = (result: QuizResultData) => {
    setCurrentResult(result);
    setResultOrigin('history');
    setPhase('result');
  };

  const currentStep = steps[currentIndex];

  return (
    <div className={styles.QuizView}>
      {phase === 'intro' ? (
        <QuizIntro
          nickname={nickname}
          onNicknameChange={setNickname}
          onStart={handleStart}
          recentResults={electionResults}
          onViewHistory={() => setPhase('history')}
          candidates={candidates}
          quizThemes={quizThemes}
        />
      ) : null}

      {phase === 'playing' && currentStep?.type === 'policy' ? (
        <QuizQuestion
          key={currentStep.id}
          step={currentStep}
          stepIndex={currentIndex}
          total={steps.length}
          canGoBack={currentIndex > 0}
          initialSelectedIds={picks
            .filter((pick) => pick.stepId === currentStep.id)
            .map((pick) => pick.candidateId)}
          onSubmit={handlePolicySubmit}
          onBack={handleBack}
        />
      ) : null}

      {phase === 'playing' && currentStep?.type === 'verify' ? (
        <QuizVerifyQuestion
          key={currentStep.id}
          step={currentStep}
          stepIndex={currentIndex}
          total={steps.length}
          canGoBack={currentIndex > 0}
          initialVerdict={
            verifyAnswers.find((answer) => answer.stepId === currentStep.id)?.verdict
          }
          onAnswer={handleVerifyAnswer}
          onBack={handleBack}
        />
      ) : null}

      {phase === 'result' && currentResult ? (
        <QuizResult
          result={currentResult}
          candidates={candidates}
          origin={resultOrigin}
          onRestart={() => setPhase('intro')}
          onViewHistory={() => setPhase('history')}
        />
      ) : null}

      {phase === 'history' ? (
        <QuizHistory
          results={electionResults}
          candidates={candidates}
          onSelect={handleSelectHistory}
          onDelete={(id) => setSavedResults(deleteResult(id))}
          onClear={() => setSavedResults(clearElectionResults(electionId))}
          onBack={() => setPhase('intro')}
        />
      ) : null}
    </div>
  );
}

export default QuizView;
