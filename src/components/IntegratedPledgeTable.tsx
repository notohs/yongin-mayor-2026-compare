import { useState } from 'react';
import type {
  BulletinData,
  Candidate,
  CandidateReview,
  PledgeCategory,
  ReviewVerdict,
} from '../data/types';
import { CATEGORY_META } from '../data/categories';
import CandidateBadge from './CandidateBadge';
import StatusChip, { type StatusTone } from './StatusChip';
import PledgeReviewDetail from './PledgeReviewDetail';
import styles from './IntegratedPledgeTable.module.scss';

interface IntegratedPledgeTableProps {
  candidates: Candidate[];
  bulletinPolicies: Record<number, BulletinData>;
  pledgeReviews?: Record<number, CandidateReview>;
}

const CATEGORY_ORDER: PledgeCategory[] = [
  'transport',
  'semiconductor',
  'economy',
  'welfare',
  'urban',
  'education',
  'culture',
  'housing',
];

const VERDICT: Record<ReviewVerdict, { tone: StatusTone; label: string }> = {
  sound: { tone: 'positive', label: '적정' },
  caution: { tone: 'warning', label: '주의' },
  unsound: { tone: 'danger', label: '부적정' },
};

type Selection =
  | { kind: 'pledge'; id: number; rank: number }
  | { kind: 'bulletin'; id: number; field: string }
  | null;

/** 공약 칩 — 매트릭스 셀 안의 5대 공약 1건 */
function PledgeChip({
  rank,
  title,
  nature,
  verdict,
  active,
  onClick,
}: {
  rank: number;
  title: string;
  nature: 'commitment' | 'aspiration';
  verdict?: ReviewVerdict;
  active: boolean;
  onClick: () => void;
}) {
  const v = verdict ? VERDICT[verdict] : null;
  return (
    <button type="button" className={`${styles.PChip} ${active ? styles.active : ''}`} onClick={onClick}>
      <span className={styles.PChipTop}>
        <span className={styles.PChipRank}>공약 {rank}</span>
        <span className={`${styles.Tag} ${nature === 'commitment' ? styles.commitment : styles.aspiration}`}>
          {nature === 'commitment' ? '공약' : '목표'}
        </span>
        {v ? (
          <span className={styles.PChipVerd}>
            <StatusChip tone={v.tone} label={v.label} />
          </span>
        ) : null}
      </span>
      <span className={styles.PChipTitle}>{title}</span>
    </button>
  );
}

/** 선거공보 세부 공약 칩 (보조) */
function BulletinChip({
  field,
  count,
  active,
  onClick,
}: {
  field: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`${styles.BChip} ${active ? styles.active : ''}`} onClick={onClick}>
      <span className={styles.BChipDoc}>선거공보 · {field}</span>
      <span className={`${styles.BChipCount} num`}>{count}건</span>
    </button>
  );
}

function IntegratedPledgeTable({
  candidates,
  bulletinPolicies,
  pledgeReviews,
}: IntegratedPledgeTableProps) {
  const [sel, setSel] = useState<Selection>(null);
  const [mob, setMob] = useState<number>(candidates[0]?.id ?? 0);

  const pledgesIn = (c: Candidate, cat: PledgeCategory) =>
    c.pledges.filter((p) => p.category === cat);
  const groupsIn = (c: Candidate, cat: PledgeCategory) =>
    (bulletinPolicies[c.id]?.groups ?? []).filter((g) => g.category === cat);
  const reviewItem = (id: number, rank: number) =>
    pledgeReviews?.[id]?.items.find((it) => it.rank === rank);

  const cats = CATEGORY_ORDER.filter((cat) =>
    candidates.some((c) => pledgesIn(c, cat).length > 0 || groupsIn(c, cat).length > 0),
  );

  const togglePledge = (id: number, rank: number) =>
    setSel((s) => (s && s.kind === 'pledge' && s.id === id && s.rank === rank ? null : { kind: 'pledge', id, rank }));
  const toggleBulletin = (id: number, field: string) =>
    setSel((s) => (s && s.kind === 'bulletin' && s.id === id && s.field === field ? null : { kind: 'bulletin', id, field }));

  const isPledgeActive = (id: number, rank: number) =>
    !!sel && sel.kind === 'pledge' && sel.id === id && sel.rank === rank;
  const isBulletinActive = (id: number, field: string) =>
    !!sel && sel.kind === 'bulletin' && sel.id === id && sel.field === field;

  const candidateOf = (id: number) => candidates.find((c) => c.id === id);
  const mobC = candidateOf(mob) ?? candidates[0];

  function renderCell(c: Candidate, cat: PledgeCategory) {
    const ps = pledgesIn(c, cat);
    const gs = groupsIn(c, cat);
    if (ps.length === 0 && gs.length === 0) return <span className={styles.Empty}>—</span>;
    return (
      <>
        {ps.map((p) => {
          const rv = reviewItem(c.id, p.rank);
          return (
            <PledgeChip
              key={`p-${p.rank}`}
              rank={p.rank}
              title={p.title}
              nature={rv?.nature ?? 'commitment'}
              verdict={rv?.verdict}
              active={isPledgeActive(c.id, p.rank)}
              onClick={() => togglePledge(c.id, p.rank)}
            />
          );
        })}
        {gs.map((g) => (
          <BulletinChip
            key={`b-${g.field}`}
            field={g.field}
            count={g.items.length}
            active={isBulletinActive(c.id, g.field)}
            onClick={() => toggleBulletin(c.id, g.field)}
          />
        ))}
      </>
    );
  }

  return (
    <div className={styles.IntegratedPledgeTable}>
      <p className={styles.Desc}>
        분야(행) × 후보(열) 통합 표입니다. 공약 칩을 누르면 목표·이행방법·이행기간·재원과 타
        정당 균형패널의 적정성 평가가 아래에 고정됩니다. ‘공약’은 임기 내 이행, ‘목표’는 장기
        지향으로 평가 기준이 다릅니다.
      </p>

      {/* 데스크톱: 매트릭스 표 */}
      <div className={styles.MatrixWrap}>
        <table className={styles.Matrix}>
          <thead>
            <tr>
              <th className={`${styles.Corner} ${styles.RowHead}`}>
                <span className={styles.CornerLabel}>분야 \ 후보</span>
              </th>
              {candidates.map((c) => (
                <th key={c.id}>
                  <div className={styles.MCand}>
                    <CandidateBadge id={c.id} color={c.partyColor} size="md" />
                    <span className={styles.MCandName}>{c.name}</span>
                    <span className={styles.MCandParty}>{c.party}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cats.map((cat) => (
              <tr key={cat}>
                <th className={styles.RowHead}>
                  <div className={styles.RowHeadLabel}>{CATEGORY_META[cat].label}</div>
                </th>
                {candidates.map((c) => {
                  const empty = pledgesIn(c, cat).length === 0 && groupsIn(c, cat).length === 0;
                  return (
                    <td key={c.id} className={`${styles.MCell} ${empty ? styles.MCellEmpty : ''}`}>
                      {renderCell(c, cat)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 후보 토글 + 분야 카드 */}
      <div className={styles.MobToggle}>
        {candidates.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.MobBtn} ${mob === c.id ? styles.on : ''}`}
            onClick={() => {
              setMob(c.id);
              setSel(null);
            }}
          >
            <CandidateBadge id={c.id} color={c.partyColor} size="sm" />
            {c.name}
          </button>
        ))}
      </div>
      <div className={styles.FieldCards}>
        {cats
          .filter((cat) => pledgesIn(mobC, cat).length > 0 || groupsIn(mobC, cat).length > 0)
          .map((cat) => (
            <div className={styles.FieldCard} key={cat}>
              <div className={styles.FieldCardHead}>
                <b>{CATEGORY_META[cat].label}</b>
              </div>
              <div className={styles.FieldCardBody}>{renderCell(mobC, cat)}</div>
            </div>
          ))}
      </div>

      {sel ? (
        <Detail sel={sel} candidateOf={candidateOf} bulletinPolicies={bulletinPolicies} pledgeReviews={pledgeReviews} onClose={() => setSel(null)} />
      ) : (
        <p className={styles.Foot}>공약 칩을 누르면 상세·검증이 여기에 표시됩니다.</p>
      )}
    </div>
  );
}

/** 핀 상세 패널 (표 아래 고정) */
function Detail({
  sel,
  candidateOf,
  bulletinPolicies,
  pledgeReviews,
  onClose,
}: {
  sel: Exclude<Selection, null>;
  candidateOf: (id: number) => Candidate | undefined;
  bulletinPolicies: Record<number, BulletinData>;
  pledgeReviews?: Record<number, CandidateReview>;
  onClose: () => void;
}) {
  const c = candidateOf(sel.id);
  if (!c) return null;

  if (sel.kind === 'bulletin') {
    const g = (bulletinPolicies[c.id]?.groups ?? []).find((x) => x.field === sel.field);
    if (!g) return null;
    return (
      <div className={styles.DetailPanel}>
        <div className={styles.DetailHead}>
          <CandidateBadge id={c.id} color={c.partyColor} size="lg" />
          <div className={styles.DetailHeadText}>
            <div className={styles.DetailTitle}>
              {g.field}
              {g.headline ? ` · ${g.headline}` : ''}
            </div>
            <div className={styles.DetailSub}>
              {c.name} · {c.party} · 선거공보 세부 공약
            </div>
          </div>
          <button className={styles.DetailClose} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className={styles.DSec}>
          <div className={styles.DSecLabel}>세부 공약</div>
          <ul>
            {g.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const p = c.pledges.find((x) => x.rank === sel.rank);
  if (!p) return null;
  const review = pledgeReviews?.[c.id]?.items.find((it) => it.rank === sel.rank);
  const reviewer = pledgeReviews?.[c.id]?.reviewer;
  const cat = CATEGORY_META[p.category];

  return (
    <div className={styles.DetailPanel}>
      <div className={styles.DetailHead}>
        <CandidateBadge id={c.id} color={c.partyColor} size="lg" />
        <div className={styles.DetailHeadText}>
          <div className={styles.DetailTitle}>{p.title}</div>
          <div className={styles.DetailSub}>
            {c.name} · {c.party} · {cat.label} · 공약 {p.rank}순위 ·{' '}
            {(review?.nature ?? 'commitment') === 'commitment' ? '공약(임기 내 이행)' : '목표(장기 지향)'}
          </div>
        </div>
        <button className={styles.DetailClose} onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>

      <div className={styles.DetailGrid}>
        <div className={styles.DSec}>
          <div className={styles.DSecLabel}>목표</div>
          <ul>{p.goals.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className={styles.DSec}>
          <div className={styles.DSecLabel}>이행 방법</div>
          <ul>{p.methods.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className={styles.DSec}>
          <div className={styles.DSecLabel}>이행 기간</div>
          <ul>{p.period.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className={styles.DSec}>
          <div className={styles.DSecLabel}>재원 조달</div>
          <ul>{p.funding.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>

      {review ? (
        <>
          <div className={styles.DetailVerdictRow}>
            <span className={styles.DetailVerdictLabel}>적정성 종합</span>
            <StatusChip tone={VERDICT[review.verdict].tone} label={VERDICT[review.verdict].label} />
            {reviewer ? <span className={styles.DetailReviewer}>· 검증 {reviewer}</span> : null}
          </div>
          <PledgeReviewDetail review={review} />
        </>
      ) : null}
    </div>
  );
}

export default IntegratedPledgeTable;
