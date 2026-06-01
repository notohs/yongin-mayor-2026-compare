import { useMemo, useState } from 'react';
import { elections } from './data/elections';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import TabBar, { type TabItem } from './components/TabBar';
import OverviewView from './components/OverviewView';
import PledgesTab from './components/PledgesTab';
import VerificationView from './components/VerificationView';
import QuizView from './components/QuizView';
import CandidateDetailModal from './components/CandidateDetailModal';
import styles from './App.module.scss';

type TabKey = 'overview' | 'pledges' | 'verification' | 'quiz';

const TABS: TabItem[] = [
  { key: 'overview', label: '종합 비교' },
  { key: 'pledges', label: '공약 비교' },
  { key: 'verification', label: '인물·검증' },
  { key: 'quiz', label: '공약 퀴즈' },
];

function App() {
  const [electionId, setElectionId] = useState<string>(elections[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [detailId, setDetailId] = useState<number | null>(null);

  const election = useMemo(
    () => elections.find((item) => item.id === electionId) ?? elections[0],
    [electionId],
  );

  const detailCandidate = useMemo(
    () => election.candidates.find((candidate) => candidate.id === detailId) ?? null,
    [election, detailId],
  );

  const handleElectionChange = (id: string) => {
    setElectionId(id);
    setDetailId(null);
  };

  return (
    <div className={styles.App}>
      <AppHeader
        meta={election.meta}
        elections={elections.map((item) => ({ id: item.id, region: item.meta.region }))}
        selectedId={election.id}
        onSelect={handleElectionChange}
      />
      <TabBar
        tabs={TABS}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      <main className={styles.Main}>
        {activeTab === 'overview' ? (
          <OverviewView candidates={election.candidates} onOpenDetail={setDetailId} />
        ) : null}
        {activeTab === 'pledges' ? (
          <PledgesTab
            candidates={election.candidates}
            bulletinPolicies={election.bulletinPolicies}
          />
        ) : null}
        {activeTab === 'verification' ? (
          <VerificationView candidates={election.candidates} />
        ) : null}
        {activeTab === 'quiz' ? (
          <QuizView
            key={election.id}
            electionId={election.id}
            candidates={election.candidates}
            quizThemes={election.quizThemes}
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
