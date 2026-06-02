import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import type {
  BulletinData,
  Candidate,
  CandidateReview,
  PledgeCategory,
  PledgeReviewItem,
  Pledge,
  ReviewVerdict,
} from '../data/types';
import { CATEGORY_META } from '../data/categories';
import CandidateBadge from './CandidateBadge';
import SectionTitle from './SectionTitle';
import PledgeReviewDetail, { RecycleMiniBadges } from './PledgeReviewDetail';
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

const VERDICT_LABEL: Record<ReviewVerdict, string> = {
  sound: '적정',
  caution: '주의',
  unsound: '부적정',
};

interface TipState {
  key: string;
  rect: DOMRect;
  node: ReactNode;
}

/** 5대 공약 1건의 상세 툴팁(목표·이행방법·이행기간·재원 + 적정성 평가) */
function pledgeTooltip(pledge: Pledge, review?: PledgeReviewItem): ReactNode {
  const section = (label: string, items: string[]) =>
    items.length > 0 ? (
      <div className={styles.TipSection}>
        <span className={styles.TipLabel}>{label}</span>
        <ul>
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div className={styles.TipBody}>
      <div className={styles.TipHead}>
        <span className={styles.TipRank}>공약 {pledge.rank}</span>
        <strong className={styles.TipTitle}>{pledge.title}</strong>
      </div>
      {review ? (
        <>
          <div className={styles.TipStatus}>
            <span className={`${styles.TipNature} ${styles[review.nature]}`}>
              {review.nature === 'commitment' ? '공약' : '목표'}
            </span>
            <span className={`${styles.TipVerdict} ${styles[review.verdict]}`}>
              적정성 {VERDICT_LABEL[review.verdict]}
            </span>
            <RecycleMiniBadges review={review} />
          </div>
          <PledgeReviewDetail review={review} />
        </>
      ) : null}
      {section('목표', pledge.goals)}
      {section('이행방법', pledge.methods)}
      {section('이행기간', pledge.period)}
      {section('재원조달', pledge.funding)}
    </div>
  );
}

/** 통합 공약 비교 테이블: 분야(행) × 후보(열), 항목 호버 시 상세 툴팁 */
function IntegratedPledgeTable({
  candidates,
  bulletinPolicies,
  pledgeReviews,
}: IntegratedPledgeTableProps) {
  const [hover, setHover] = useState<TipState | null>(null);
  const [pin, setPin] = useState<TipState | null>(null);
  const active = pin ?? hover;
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 스크롤·리사이즈 시 툴팁 닫기(fixed 위치 어긋남 방지). 단, 툴팁 내부 스크롤은 무시.
  useEffect(() => {
    if (!active) return undefined;
    const close = (e?: Event) => {
      if (e && tooltipRef.current && e.target instanceof Node && tooltipRef.current.contains(e.target)) {
        return;
      }
      setHover(null);
      setPin(null);
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [active]);

  const corePledges = (c: Candidate, cat: PledgeCategory) =>
    c.pledges.filter((p) => p.category === cat);
  const bulletinGroups = (c: Candidate, cat: PledgeCategory) =>
    (bulletinPolicies[c.id]?.groups ?? []).filter((g) => g.category === cat);
  const reviewFor = (c: Candidate, rank: number) =>
    pledgeReviews?.[c.id]?.items.find((it) => it.rank === rank);

  const rows = CATEGORY_ORDER.filter((cat) =>
    candidates.some((c) => corePledges(c, cat).length > 0 || bulletinGroups(c, cat).length > 0),
  );

  const handleEnter = (e: ReactMouseEvent<HTMLElement>, key: string, node: ReactNode) => {
    if (pin) return;
    setHover({ key, node, rect: e.currentTarget.getBoundingClientRect() });
  };
  const handleLeave = (key: string) => setHover((h) => (h?.key === key ? null : h));
  const togglePin = (e: ReactMouseEvent<HTMLElement>, key: string, node: ReactNode) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPin((p) => (p?.key === key ? null : { key, node, rect }));
  };

  // 툴팁 위치 계산 (뷰포트 기준 fixed)
  const tipStyle = (): CSSProperties => {
    if (!active) return {};
    const r = active.rect;
    const below = r.top < window.innerHeight * 0.5;
    const left = Math.min(Math.max(r.left, 8), window.innerWidth - 380);
    return below
      ? { left, top: r.bottom + 8 }
      : { left, top: r.top - 8, transform: 'translateY(-100%)' };
  };

  return (
    <div className={styles.IntegratedPledgeTable}>
      <SectionTitle
        title="공약 한눈에 비교"
        description="분야(행) × 후보(열) 통합 표입니다. 각 공약·세부 항목에 마우스를 올리면 목표·이행방법·이행기간·재원조달과 적정성 평가가 툴팁으로 펼쳐집니다. (모바일·고정: 항목을 탭/클릭) 가로로 스크롤하면 모든 후보를 볼 수 있어요."
      />

      <div className={styles.Scroll}>
        <div
          className={styles.Grid}
          style={{ gridTemplateColumns: `160px repeat(${candidates.length}, minmax(220px, 1fr))` }}
        >
          {/* 헤더 */}
          <div className={`${styles.Cell} ${styles.cornerCell}`} />
          {candidates.map((c) => (
            <div key={c.id} className={`${styles.Cell} ${styles.headCell}`}>
              <CandidateBadge id={c.id} color={c.partyColor} size="sm" />
              <span className={styles.HeadName}>{c.name}</span>
              <span className={styles.HeadParty}>{c.party}</span>
            </div>
          ))}

          {/* 분야별 행 */}
          {rows.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <Fragment key={cat}>
                <div className={`${styles.Cell} ${styles.labelCell}`}>{meta.label}</div>
                {candidates.map((c) => {
                  const core = corePledges(c, cat);
                  const groups = bulletinGroups(c, cat);
                  if (core.length === 0 && groups.length === 0) {
                    return (
                      <div key={c.id} className={`${styles.Cell} ${styles.dataCell}`}>
                        <span className={styles.Empty}>—</span>
                      </div>
                    );
                  }
                  return (
                    <div key={c.id} className={`${styles.Cell} ${styles.dataCell}`}>
                      {core.map((pledge) => {
                        const review = reviewFor(c, pledge.rank);
                        const key = `p-${c.id}-${pledge.rank}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`${styles.PledgeChip} ${
                              review ? styles[review.verdict] : ''
                            } ${pin?.key === key ? styles.pinned : ''}`}
                            onMouseEnter={(e) => handleEnter(e, key, pledgeTooltip(pledge, review))}
                            onMouseLeave={() => handleLeave(key)}
                            onClick={(e) => togglePin(e, key, pledgeTooltip(pledge, review))}
                          >
                            <span className={styles.ChipTop}>
                              <span className={styles.ChipRank}>공약 {pledge.rank}</span>
                              {review ? (
                                <span
                                  className={`${styles.ChipNature} ${styles[review.nature]}`}
                                >
                                  {review.nature === 'commitment' ? '공약' : '목표'}
                                </span>
                              ) : null}
                              {review ? <RecycleMiniBadges review={review} /> : null}
                              {review ? (
                                <span
                                  className={`${styles.ChipDot} ${styles[review.verdict]}`}
                                  title={`적정성 ${VERDICT_LABEL[review.verdict]}`}
                                />
                              ) : null}
                            </span>
                            <span className={styles.ChipTitle}>{pledge.title}</span>
                          </button>
                        );
                      })}
                      {groups.map((g) => {
                        const key = `b-${c.id}-${g.field}`;
                        const node = (
                          <div className={styles.TipBody}>
                            <div className={styles.TipHead}>
                              <span className={styles.TipRank}>선거공보</span>
                              <strong className={styles.TipTitle}>
                                {g.field}
                                {g.headline ? ` · ${g.headline}` : ''}
                              </strong>
                            </div>
                            <div className={styles.TipSection}>
                              <ul>
                                {g.items.map((it) => (
                                  <li key={it}>{it}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`${styles.BulletinChip} ${pin?.key === key ? styles.pinned : ''}`}
                            onMouseEnter={(e) => handleEnter(e, key, node)}
                            onMouseLeave={() => handleLeave(key)}
                            onClick={(e) => togglePin(e, key, node)}
                          >
                            <span className={styles.ChipDoc}>선거공보 · {g.field}</span>
                            <span className={styles.ChipCount}>{g.items.length}건</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>

      {active ? (
        <div
          ref={tooltipRef}
          className={`${styles.Tooltip} ${pin ? styles.tooltipPinned : ''}`}
          style={tipStyle()}
          role="tooltip"
        >
          {pin ? <span className={styles.PinHint}>고정됨 · 다시 클릭하면 닫힘</span> : null}
          {active.node}
        </div>
      ) : null}
    </div>
  );
}

export default IntegratedPledgeTable;
