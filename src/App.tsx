import { lazy, Suspense, useMemo, useState } from 'react';
import { elections as builtinElections } from './data/elections';
import type { Election } from './data/types';
import { loadCustomElections } from './utils/customElections';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import TabBar, { type TabItem } from './components/TabBar';
import OverviewView from './components/OverviewView';
import PledgesTab from './components/PledgesTab';
import VerificationView from './components/VerificationView';
import QuizView from './components/QuizView';
import CandidateDetailModal from './components/CandidateDetailModal';
import styles from './App.module.scss';

// 관리자 콘솔(및 pdf.js/tesseract)은 열 때만 로드해 공개 앱 번들을 가볍게 유지
const AdminConsole = lazy(() => import('./components/admin/AdminConsole'));

type TabKey = 'overview' | 'pledges' | 'verification' | 'quiz';

const TABS: TabItem[] = [
  { key: 'overview', label: '종합 비교' },
  { key: 'pledges', label: '공약 비교' },
  { key: 'verification', label: '인물·검증' },
  { key: 'quiz', label: '공약 퀴즈' },
];

function App() {
  const [customElections, setCustomElections] = useState<Election[]>(() => loadCustomElections());
  const [mode, setMode] = useState<'app' | 'admin'>('app');
  const [electionId, setElectionId] = useState<string>(builtinElections[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [detailId, setDetailId] = useState<number | null>(null);

  // 빌트인(저장소 폴더) + 커스텀(콘솔 업로드) 선거구 병합
  const allElections = useMemo(() => {
    const builtinIds = new Set(builtinElections.map((e) => e.id));
    const customs = customElections.filter((e) => !builtinIds.has(e.id));
    return [...builtinElections, ...customs].sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id),
    );
  }, [customElections]);

  const election = useMemo(
    () => allElections.find((item) => item.id === electionId) ?? allElections[0],
    [allElections, electionId],
  );

  const detailCandidate = useMemo(
    () => election.candidates.find((candidate) => candidate.id === detailId) ?? null,
    [election, detailId],
  );

  const handleElectionChange = (id: string) => {
    setElectionId(id);
    setDetailId(null);
  };

  // 콘솔에서 저장/미리보기 → 목록 갱신 + 해당 선거구로 이동
  const handleCustomChange = (next: Election[], focusId?: string) => {
    setCustomElections(next);
    if (focusId) {
      setElectionId(focusId);
      setActiveTab('overview');
      setMode('app');
    }
  };

  if (mode === 'admin') {
    return (
      <Suspense fallback={<div className={styles.Loading}>관리자 콘솔 불러오는 중…</div>}>
        <AdminConsole
          customElections={customElections}
          onChange={handleCustomChange}
          onExit={() => setMode('app')}
        />
      </Suspense>
    );
  }

  return (
    <div className={styles.App}>
      <AppHeader
        meta={election.meta}
        elections={allElections.map((item) => ({ id: item.id, region: item.meta.region }))}
        selectedId={election.id}
        onSelect={handleElectionChange}
        onOpenAdmin={() => setMode('admin')}
      />
      <TabBar
        tabs={TABS}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      <main className={styles.Main}>
        {activeTab === 'overview' ? (
          <OverviewView
            candidates={election.candidates}
            pledgeReviews={election.pledgeReviews}
            onOpenDetail={setDetailId}
          />
        ) : null}
        {activeTab === 'pledges' ? (
          <PledgesTab
            candidates={election.candidates}
            bulletinPolicies={election.bulletinPolicies}
            pledgeReviews={election.pledgeReviews}
          />
        ) : null}
        {activeTab === 'verification' ? (
          <VerificationView
            candidates={election.candidates}
            pledgeReviews={election.pledgeReviews}
          />
        ) : null}
        {activeTab === 'quiz' ? (
          <QuizView
            key={election.id}
            electionId={election.id}
            candidates={election.candidates}
            quizThemes={election.quizThemes}
            pledgeReviews={election.pledgeReviews}
          />
        ) : null}
      </main>

      <AppFooter meta={election.meta} />

      <CandidateDetailModal
        candidate={detailCandidate}
        bulletinPolicies={election.bulletinPolicies}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

export default App;
