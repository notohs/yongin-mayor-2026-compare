import { useEffect } from 'react';
import type { BulletinData, Candidate } from '../data/types';
import { formatMoney, formatThousandWon } from '../utils/format';
import CandidateBadge from './CandidateBadge';
import PledgeCard from './PledgeCard';
import BulletinPolicies from './BulletinPolicies';
import StatusChip from './StatusChip';
import MaterialStatus from './MaterialStatus';
import styles from './CandidateDetailModal.module.scss';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  bulletinPolicies: Record<number, BulletinData>;
  onClose: () => void;
}

interface InfoItemProps {
  label: string;
  children: React.ReactNode;
}

function InfoItem({ label, children }: InfoItemProps) {
  return (
    <div className={styles.InfoItem}>
      <span className={styles.InfoLabel}>{label}</span>
      <div className={styles.InfoValue}>{children}</div>
    </div>
  );
}

/** 후보 1인의 전체 정보를 보여주는 모달 */
function CandidateDetailModal({
  candidate,
  bulletinPolicies,
  onClose,
}: CandidateDetailModalProps) {
  useEffect(() => {
    if (!candidate) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [candidate, onClose]);

  if (!candidate) return null;

  return (
    <div className={styles.Backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.Modal}
        role="dialog"
        aria-modal="true"
        aria-label={`${candidate.name} 후보 상세 정보`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.CloseButton} onClick={onClose} aria-label="닫기">
          ✕
        </button>

        <div className={styles.Hero} style={{ backgroundColor: candidate.partyColor }}>
          <img
            className={styles.HeroPoster}
            src={candidate.poster}
            alt={`${candidate.name} 후보 선거공보 표지`}
          />
          <div className={styles.HeroText}>
            <div className={styles.HeroName}>
              <CandidateBadge id={candidate.id} color="rgba(255,255,255,0.25)" size="md" />
              <span>{candidate.name}</span>
            </div>
            <p className={styles.HeroParty}>{candidate.party}</p>
            <p className={styles.HeroSlogan}>“{candidate.slogan}”</p>
            {candidate.subSlogan ? (
              <p className={styles.HeroSubSlogan}>{candidate.subSlogan}</p>
            ) : null}
          </div>
        </div>

        <div className={styles.ScrollArea}>
          <p className={styles.Vision}>{candidate.vision}</p>

          <section className={styles.Block}>
            <h3 className={styles.BlockTitle}>인적사항</h3>
            <div className={styles.InfoGrid}>
              <InfoItem label="생년월일">
                {candidate.birth} (만 {candidate.age}세)
              </InfoItem>
              <InfoItem label="성별">{candidate.gender}</InfoItem>
              <InfoItem label="직업">{candidate.job}</InfoItem>
              <InfoItem label="학력">{candidate.education}</InfoItem>
              <InfoItem label="주요 경력">
                <ul className={styles.CareerList}>
                  {candidate.careers.map((career) => (
                    <li key={career}>{career}</li>
                  ))}
                </ul>
              </InfoItem>
            </div>
          </section>

          <section className={styles.Block}>
            <h3 className={styles.BlockTitle}>선관위 자료 제출 현황</h3>
            <MaterialStatus materials={candidate.materials} />
          </section>

          <section className={styles.Block}>
            <h3 className={styles.BlockTitle}>재산 · 납세 · 병역 · 전과</h3>
            <div className={styles.InfoGrid}>
              <InfoItem label="재산 (신고 총액)">
                <strong
                  style={{ color: candidate.assets.total < 0 ? 'var(--danger)' : undefined }}
                >
                  {formatMoney(candidate.assets.total)}
                </strong>
                <span className={styles.FaintLine}>{candidate.assets.breakdown}</span>
              </InfoItem>
              <InfoItem label="납세 (최근 5년)">
                {formatThousandWon(candidate.tax.totalPaid)}
                <span className={styles.FaintLine}>
                  본인 {formatThousandWon(candidate.tax.candidatePaid)}
                </span>
              </InfoItem>
              <InfoItem label="체납">
                <StatusChip
                  tone={candidate.tax.currentArrears > 0 ? 'danger' : 'positive'}
                  label={
                    candidate.tax.currentArrears > 0
                      ? formatThousandWon(candidate.tax.currentArrears)
                      : '현 체납 없음'
                  }
                />
                {candidate.tax.note ? (
                  <span className={styles.FaintLine}>{candidate.tax.note}</span>
                ) : null}
              </InfoItem>
              <InfoItem label="병역">
                {candidate.military.candidate}
                {candidate.military.note ? (
                  <span className={styles.FaintLine}>{candidate.military.note}</span>
                ) : null}
              </InfoItem>
              <InfoItem label="전과">
                <StatusChip
                  tone={candidate.criminal.hasRecord ? 'danger' : 'positive'}
                  label={
                    candidate.criminal.hasRecord
                      ? `전과 ${candidate.criminal.items.length}건`
                      : '전과 없음'
                  }
                />
                {candidate.criminal.hasRecord ? (
                  <ul className={styles.CareerList}>
                    {candidate.criminal.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </InfoItem>
            </div>
          </section>

          <section className={styles.Block}>
            <h3 className={styles.BlockTitle}>5대 공약</h3>
            <div className={styles.PledgeList}>
              {candidate.pledges.map((pledge) => (
                <PledgeCard
                  key={pledge.rank}
                  pledge={pledge}
                  accentColor={candidate.partyColor}
                />
              ))}
            </div>
          </section>

          <section className={styles.Block}>
            <h3 className={styles.BlockTitle}>선거공보 세부 공약</h3>
            <BulletinPolicies
              data={bulletinPolicies[candidate.id]}
              accentColor={candidate.partyColor}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default CandidateDetailModal;
